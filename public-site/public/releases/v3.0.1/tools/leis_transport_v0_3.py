#!/usr/bin/env python3
"""LEIS transport/local retrieval v0.3, standard-library implementation.

This tool validates bounded transport envelopes and resolves allowlisted local
record IDs from one explicitly supplied index. It has no network listener and
does not execute content returned in a PONG.
"""

from __future__ import annotations

import copy
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any


VERSION = "0.3"
ID_RE = re.compile(r"^[A-Z][A-Z0-9_-]{2,63}$")
LABELS = {"VERIFIED", "REPORTED", "INTERPRETATION", "HYPOTHESIS", "UNKNOWN", "REJECTED"}
PING_FIELDS = {
    "protocol_version", "message_type", "ping_id", "space", "record_ids",
    "purpose", "nonce", "max_items", "max_bytes"
}


class InputFailure(Exception):
    def __init__(self, state: str, message: str):
        super().__init__(message)
        self.state = state
        self.message = message


def load_utf8(path: str | Path) -> dict[str, Any]:
    try:
        raw = Path(path).read_bytes()
        text = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError as exc:
        raise InputFailure("HOLD_ENCODING", f"invalid UTF-8: {exc}") from exc
    try:
        value = json.loads(text)
    except json.JSONDecodeError as exc:
        raise InputFailure("HOLD_SCHEMA", f"invalid JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise InputFailure("HOLD_SCHEMA", "top-level JSON value must be an object")
    return value


def canonical_bytes(value: dict[str, Any]) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("ascii")


def digest(value: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def valid_id(value: Any) -> bool:
    return isinstance(value, str) and ID_RE.fullmatch(value) is not None


def duplicate_values(values: list[str]) -> list[str]:
    seen: set[str] = set()
    duplicated: set[str] = set()
    for value in values:
        if value in seen:
            duplicated.add(value)
        seen.add(value)
    return sorted(duplicated)


def hold_pong(ping: dict[str, Any], state: str, gaps: list[str]) -> dict[str, Any]:
    ping_id = ping.get("ping_id") if valid_id(ping.get("ping_id")) else "PING-INVALID"
    space = ping.get("space") if valid_id(ping.get("space")) else "LEIS_CORE"
    nonce = ping.get("nonce") if isinstance(ping.get("nonce"), str) and len(ping.get("nonce")) >= 8 else "INVALID-NONCE"
    return {
        "protocol_version": VERSION,
        "message_type": "PONG",
        "pong_id": "PONG-HOLD-001",
        "ping_id": ping_id,
        "space": space,
        "nonce": nonce,
        "request_sha256": digest(ping),
        "state": state,
        "records": [],
        "gaps": gaps,
        "instructions_executable": False,
        "external_action_performed": False
    }


def validate_ping(ping: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    missing = sorted(PING_FIELDS - set(ping))
    extra = sorted(set(ping) - PING_FIELDS)
    if missing:
        errors.append("missing fields: " + ", ".join(missing))
    if extra:
        errors.append("unknown fields: " + ", ".join(extra))
    if ping.get("protocol_version") != VERSION:
        errors.append("protocol_version must be 0.3")
    if ping.get("message_type") != "PING":
        errors.append("message_type must be PING")
    for field in ("ping_id", "space"):
        if not valid_id(ping.get(field)):
            errors.append(f"{field} is not a valid transport ID")
    if not isinstance(ping.get("purpose"), str) or not ping.get("purpose", "").strip() or len(ping.get("purpose", "")) > 500:
        errors.append("purpose must be 1-500 characters")
    if not isinstance(ping.get("nonce"), str) or not 8 <= len(ping.get("nonce", "")) <= 128:
        errors.append("nonce must be 8-128 characters")
    record_ids = ping.get("record_ids")
    if not isinstance(record_ids, list) or not 1 <= len(record_ids) <= 8:
        errors.append("record_ids must contain 1-8 items")
    else:
        if any(not valid_id(value) for value in record_ids):
            errors.append("record_ids contains invalid ID or path-like data")
        repeated = duplicate_values([str(value) for value in record_ids])
        if repeated:
            errors.append("duplicate record IDs: " + ", ".join(repeated))
    if not isinstance(ping.get("max_items"), int) or not 1 <= ping.get("max_items", 0) <= 8:
        errors.append("max_items must be an integer from 1 to 8")
    if not isinstance(ping.get("max_bytes"), int) or not 256 <= ping.get("max_bytes", 0) <= 8192:
        errors.append("max_bytes must be an integer from 256 to 8192")
    if isinstance(record_ids, list) and isinstance(ping.get("max_items"), int) and len(record_ids) > ping["max_items"]:
        errors.append("record_ids exceeds max_items")
    return errors


def validate_index(index: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if set(index) != {"protocol_version", "space", "records"}:
        errors.append("index fields must be protocol_version, space, records")
    if index.get("protocol_version") != VERSION:
        errors.append("index protocol_version must be 0.3")
    if not valid_id(index.get("space")):
        errors.append("index space is invalid")
    records = index.get("records")
    if not isinstance(records, list):
        return errors + ["index records must be an array"]
    ids: list[str] = []
    required = {"record_id", "label", "content", "source_refs"}
    for record in records:
        if not isinstance(record, dict) or set(record) != required:
            errors.append("every index record must contain only record_id, label, content, source_refs")
            continue
        record_id = record.get("record_id")
        if not valid_id(record_id):
            errors.append("index contains invalid record ID")
        else:
            ids.append(record_id)
        if record.get("label") not in LABELS:
            errors.append(f"record {record_id} has invalid label")
        if not isinstance(record.get("content"), str):
            errors.append(f"record {record_id} content must be text")
        if not isinstance(record.get("source_refs"), list) or not all(isinstance(x, str) for x in record.get("source_refs", [])):
            errors.append(f"record {record_id} source_refs must be text array")
    repeated = duplicate_values(ids)
    if repeated:
        errors.append("duplicate index record IDs: " + ", ".join(repeated))
    return errors


def make_record(record: dict[str, Any]) -> dict[str, Any]:
    base = {
        "record_id": record["record_id"],
        "label": record["label"],
        "content": record["content"],
        "source_refs": record["source_refs"],
        "content_role": "data_only"
    }
    base["record_sha256"] = digest(base)
    return base


def resolve_ping(ping: dict[str, Any], index: dict[str, Any]) -> dict[str, Any]:
    ping_errors = validate_ping(ping)
    index_errors = validate_index(index)
    if ping_errors or index_errors:
        return hold_pong(ping, "HOLD_SCHEMA", ping_errors + index_errors)
    if ping["space"] != index["space"]:
        return hold_pong(ping, "HOLD_SPACE", ["PING space does not match the explicit local index space."])
    record_map = {item["record_id"]: item for item in index["records"]}
    unknown = [record_id for record_id in ping["record_ids"] if record_id not in record_map]
    if unknown:
        return hold_pong(ping, "HOLD_UNKNOWN_RECORD", ["Unknown record IDs: " + ", ".join(unknown)])
    records = [make_record(record_map[record_id]) for record_id in ping["record_ids"]]
    response_size = len(json.dumps(records, ensure_ascii=False).encode("utf-8"))
    if response_size > ping["max_bytes"]:
        return hold_pong(ping, "HOLD_SIZE", [f"Bounded response would be {response_size} bytes, above max_bytes."])
    return {
        "protocol_version": VERSION,
        "message_type": "PONG",
        "pong_id": "PONG-" + ping["ping_id"][5:] if ping["ping_id"].startswith("PING-") else "PONG-LOCAL-001",
        "ping_id": ping["ping_id"],
        "space": ping["space"],
        "nonce": ping["nonce"],
        "request_sha256": digest(ping),
        "state": "CANDIDATE_DATA_REVIEW",
        "records": records,
        "gaps": [],
        "instructions_executable": False,
        "external_action_performed": False
    }


def check_pong(ping: dict[str, Any], pong: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    required = {
        "protocol_version", "message_type", "pong_id", "ping_id", "space", "nonce",
        "request_sha256", "state", "records", "gaps", "instructions_executable",
        "external_action_performed"
    }
    if set(pong) != required:
        errors.append("PONG has unknown or missing fields")
    if pong.get("protocol_version") != VERSION or pong.get("message_type") != "PONG":
        errors.append("PONG protocol identity mismatch")
    if pong.get("ping_id") != ping.get("ping_id") or pong.get("space") != ping.get("space"):
        errors.append("PONG request identity or Space mismatch")
    if pong.get("nonce") != ping.get("nonce") or pong.get("request_sha256") != digest(ping):
        errors.append("PONG nonce or request digest mismatch")
    if pong.get("instructions_executable") is not False or pong.get("external_action_performed") is not False:
        errors.append("PONG attempted executable instruction or external action")
    records = pong.get("records")
    if not isinstance(records, list):
        errors.append("PONG records must be an array")
    else:
        ids = []
        for record in records:
            if not isinstance(record, dict):
                errors.append("PONG record must be an object")
                continue
            ids.append(record.get("record_id", ""))
            claimed_digest = record.get("record_sha256")
            unsigned = {key: value for key, value in record.items() if key != "record_sha256"}
            if claimed_digest != digest(unsigned):
                errors.append(f"record {record.get('record_id', '?')} digest mismatch")
            if record.get("content_role") != "data_only":
                errors.append(f"record {record.get('record_id', '?')} is not data_only")
        repeated = duplicate_values(ids)
        if repeated:
            errors.append("duplicate PONG record IDs: " + ", ".join(repeated))
    return {
        "state": "CANDIDATE_DATA_REVIEW" if not errors else "HOLD_INTEGRITY",
        "errors": errors,
        "records_are_data_only": not errors,
        "semantic_truth_proven": False,
        "external_action_performed": False
    }


def validate_capsule(capsule: dict[str, Any]) -> list[str]:
    required = {
        "protocol_version", "message_type", "capsule_id", "space", "seed_ref", "task",
        "human_orientation", "source_manifest", "claims", "critical_anchors", "lineage_delta",
        "unknowns", "next_action", "privacy_boundary", "non_claims", "encoding"
    }
    errors: list[str] = []
    if set(capsule) != required:
        errors.append("Capsule has unknown or missing fields")
    if capsule.get("protocol_version") != VERSION or capsule.get("message_type") != "CAPSULE":
        errors.append("Capsule protocol identity mismatch")
    for field in ("capsule_id", "space", "seed_ref"):
        if not valid_id(capsule.get(field)):
            errors.append(f"Capsule {field} is invalid")
    if capsule.get("encoding") != "UTF-8":
        errors.append("Capsule encoding must be UTF-8")
    if len(canonical_bytes(capsule)) > 16384:
        errors.append("Capsule exceeds 16384 canonical bytes")
    source_ids: set[str] = set()
    for source in capsule.get("source_manifest", []) if isinstance(capsule.get("source_manifest"), list) else []:
        if isinstance(source, dict) and valid_id(source.get("id")) and source.get("content_role") == "data_only":
            source_ids.add(source["id"])
        else:
            errors.append("Capsule source is invalid or not data_only")
    claim_ids: list[str] = []
    for claim in capsule.get("claims", []) if isinstance(capsule.get("claims"), list) else []:
        if not isinstance(claim, dict) or not valid_id(claim.get("id")) or claim.get("label") not in LABELS:
            errors.append("Capsule claim is invalid")
            continue
        claim_ids.append(claim["id"])
        if set(claim.get("source_refs", [])) - source_ids:
            errors.append(f"claim {claim['id']} references unknown source")
        if claim.get("label") == "VERIFIED" and not claim.get("source_refs"):
            errors.append(f"VERIFIED claim {claim['id']} requires a source")
    if duplicate_values(claim_ids):
        errors.append("Capsule has duplicate claim IDs")
    return errors


def validate_bridge(bridge: dict[str, Any]) -> list[str]:
    required = {
        "protocol_version", "message_type", "bridge_id", "source_space", "target_space", "purpose",
        "source_capsule_sha256", "allowed_claim_ids", "excluded_data", "owner_approval",
        "review_condition", "nonce"
    }
    errors: list[str] = []
    if set(bridge) != required:
        errors.append("Bridge Capsule has unknown or missing fields")
    if bridge.get("protocol_version") != VERSION or bridge.get("message_type") != "BRIDGE_CAPSULE":
        errors.append("Bridge Capsule protocol identity mismatch")
    for field in ("bridge_id", "source_space", "target_space"):
        if not valid_id(bridge.get(field)):
            errors.append(f"Bridge Capsule {field} is invalid")
    if bridge.get("source_space") == bridge.get("target_space"):
        errors.append("Bridge Capsule must cross two different Spaces")
    claim_ids = bridge.get("allowed_claim_ids")
    if not isinstance(claim_ids, list) or not claim_ids or any(not valid_id(item) for item in claim_ids):
        errors.append("Bridge allowed_claim_ids is invalid")
    elif duplicate_values(claim_ids):
        errors.append("Bridge allowed_claim_ids contains duplicates")
    approval = bridge.get("owner_approval")
    if not isinstance(approval, dict) or approval.get("approved") is not True or not approval.get("owner") or not approval.get("scope"):
        errors.append("Bridge Capsule lacks explicit scoped owner approval")
    return errors


def validate_seed(seed: dict[str, Any]) -> list[str]:
    required = {
        "protocol_version", "message_type", "seed_id", "seed_version", "space", "identity",
        "principles", "lineage_anchors", "golden_questions", "non_claims"
    }
    errors: list[str] = []
    if set(seed) != required:
        errors.append("Seed has unknown or missing fields")
    if seed.get("protocol_version") != VERSION or seed.get("message_type") != "SEED":
        errors.append("Seed protocol identity mismatch")
    for field in ("seed_id", "space"):
        if not valid_id(seed.get(field)):
            errors.append(f"Seed {field} is invalid")
    if not isinstance(seed.get("seed_version"), str) or re.fullmatch(r"[0-9]+\.[0-9]+", seed.get("seed_version", "")) is None:
        errors.append("Seed version is invalid")
    if not isinstance(seed.get("identity"), str) or not seed.get("identity", "").strip():
        errors.append("Seed identity is empty")
    for field in ("principles", "lineage_anchors"):
        values = seed.get(field)
        if not isinstance(values, list) or not values:
            errors.append(f"Seed {field} must be a non-empty array")
            continue
        ids = [item.get("id", "") for item in values if isinstance(item, dict)]
        if any(not valid_id(value) for value in ids) or len(ids) != len(values):
            errors.append(f"Seed {field} contains an invalid anchor")
        if duplicate_values(ids):
            errors.append(f"Seed {field} contains duplicate IDs")
    return errors


def validate_report(report: dict[str, Any]) -> list[str]:
    required = {
        "protocol_version", "message_type", "test_id", "u0_id", "gate_state", "receiver_conditions",
        "dimension_scores", "hard_gates", "reviewers", "disagreements", "observations",
        "interpretations", "non_claims"
    }
    errors: list[str] = []
    if set(report) != required:
        errors.append("Validation Report has unknown or missing fields")
    if report.get("protocol_version") != VERSION or report.get("message_type") != "VALIDATION_REPORT":
        errors.append("Validation Report protocol identity mismatch")
    for field in ("test_id", "u0_id"):
        if not valid_id(report.get(field)):
            errors.append(f"Validation Report {field} is invalid")
    if report.get("gate_state") not in {"HOLD", "PASS_FOR_HUMAN_REVIEW", "VALIDATED"}:
        errors.append("Validation Report gate_state is invalid")
    scores = report.get("dimension_scores")
    score_fields = {"identity", "principles", "lineage", "questions", "action"}
    if not isinstance(scores, dict) or set(scores) != score_fields:
        errors.append("Validation Report dimension_scores is invalid")
    elif any(not isinstance(value, int) or not 0 <= value <= 3 for value in scores.values()):
        errors.append("Validation Report scores must be integers from 0 to 3")
    reviewers = report.get("reviewers")
    if not isinstance(reviewers, list) or not all(isinstance(item, str) and item.strip() for item in reviewers):
        errors.append("Validation Report reviewers is invalid")
    elif duplicate_values(reviewers):
        errors.append("Validation Report reviewers contains duplicates")
    elif report.get("gate_state") == "VALIDATED" and len(reviewers) < 2:
        errors.append("VALIDATED semantic report requires at least two reviewers")
    return errors


def self_test() -> tuple[dict[str, Any], bool]:
    index = load_utf8("fixtures/transport-v0.3-memory-index.json")
    ping = load_utf8("fixtures/transport-v0.3-ping-valid.json")
    capsule = load_utf8("fixtures/transport-v0.3-capsule-valid.json")
    bridge = load_utf8("fixtures/transport-v0.3-bridge-valid.json")
    seed = load_utf8("fixtures/transport-v0.3-seed-valid.json")
    report = load_utf8("fixtures/transport-v0.3-validation-report-valid.json")
    cases: list[dict[str, Any]] = []

    def add(name: str, expected: str, actual: str, details: Any) -> None:
        cases.append({"case": name, "expected": expected, "actual": actual, "passed": expected == actual, "details": details})

    valid_capsule_errors = validate_capsule(capsule)
    add("valid-capsule", "PASS", "PASS" if not valid_capsule_errors else "HOLD_SCHEMA", valid_capsule_errors)

    valid_bridge_errors = validate_bridge(bridge)
    add("valid-bridge", "PASS", "PASS" if not valid_bridge_errors else "HOLD_SCHEMA", valid_bridge_errors)

    valid_seed_errors = validate_seed(seed)
    add("valid-seed", "PASS", "PASS" if not valid_seed_errors else "HOLD_SCHEMA", valid_seed_errors)

    valid_report_errors = validate_report(report)
    add("valid-validation-report", "PASS", "PASS" if not valid_report_errors else "HOLD_SCHEMA", valid_report_errors)

    invalid_validated_report = copy.deepcopy(report)
    invalid_validated_report["gate_state"] = "VALIDATED"
    invalid_report_errors = validate_report(invalid_validated_report)
    add("validated-report-one-reviewer", "HOLD_REVIEW", "HOLD_REVIEW" if invalid_report_errors else "PASS", invalid_report_errors)

    pong = resolve_ping(ping, index)
    add("valid-ping-pong", "CANDIDATE_DATA_REVIEW", pong["state"], pong)

    cross_space = copy.deepcopy(ping)
    cross_space["ping_id"] = "PING-CROSS-SPACE"
    cross_space["space"] = "LEIS_PORTAL"
    result = resolve_ping(cross_space, index)
    add("cross-space", "HOLD_SPACE", result["state"], result)

    unknown = copy.deepcopy(ping)
    unknown["ping_id"] = "PING-UNKNOWN-RECORD"
    unknown["record_ids"] = ["NOT_IN_INDEX"]
    result = resolve_ping(unknown, index)
    add("unknown-record", "HOLD_UNKNOWN_RECORD", result["state"], result)

    traversal = copy.deepcopy(ping)
    traversal["ping_id"] = "PING-PATH-TRAVERSAL"
    traversal["record_ids"] = ["../LEIS-MEMORY.md"]
    result = resolve_ping(traversal, index)
    add("path-traversal", "HOLD_SCHEMA", result["state"], result)

    duplicate = copy.deepcopy(ping)
    duplicate["ping_id"] = "PING-DUPLICATE-ID"
    duplicate["record_ids"] = ["KERNEL_CURRENT", "KERNEL_CURRENT"]
    result = resolve_ping(duplicate, index)
    add("duplicate-record", "HOLD_SCHEMA", result["state"], result)

    too_many = copy.deepcopy(ping)
    too_many["ping_id"] = "PING-TOO-MANY"
    too_many["record_ids"] = [f"RECORD-{i}" for i in range(9)]
    too_many["max_items"] = 8
    result = resolve_ping(too_many, index)
    add("request-size", "HOLD_SCHEMA", result["state"], result)

    response_too_large = copy.deepcopy(ping)
    response_too_large["ping_id"] = "PING-RESPONSE-SIZE"
    response_too_large["record_ids"] = ["KERNEL_CURRENT", "MATH_REPLAY_GAP"]
    response_too_large["max_bytes"] = 256
    result = resolve_ping(response_too_large, index)
    add("response-size", "HOLD_SIZE", result["state"], result)

    tampered_pong = copy.deepcopy(pong)
    tampered_pong["records"][0]["content"] = "tampered content"
    checked = check_pong(ping, tampered_pong)
    add("tampered-pong", "HOLD_INTEGRITY", checked["state"], checked)

    injection_ping = copy.deepcopy(ping)
    injection_ping["ping_id"] = "PING-INJECTION-DATA"
    injection_ping["record_ids"] = ["INJECTION_TRAP"]
    injection_result = resolve_ping(injection_ping, index)
    injection_ok = (
        injection_result["state"] == "CANDIDATE_DATA_REVIEW"
        and injection_result["instructions_executable"] is False
        and injection_result["external_action_performed"] is False
        and injection_result["records"][0]["content_role"] == "data_only"
    )
    add("prompt-injection-as-data", "PASS", "PASS" if injection_ok else "FAIL", injection_result)

    mojibake_ping = copy.deepcopy(ping)
    mojibake_ping["purpose"] = "Recover Reality â†’ Observation"
    mojibake_pong = resolve_ping(mojibake_ping, index)
    checked = check_pong(ping, mojibake_pong)
    add("mojibake-content-digest", "HOLD_INTEGRITY", checked["state"], checked)

    invalid_utf8_path = Path("tmp/invalid-utf8-v0.3.json")
    invalid_utf8_path.parent.mkdir(exist_ok=True)
    invalid_utf8_path.write_bytes(b'{"x":"\xff"}')
    try:
        load_utf8(invalid_utf8_path)
        encoding_state = "FAIL"
        encoding_detail = "invalid bytes unexpectedly decoded"
    except InputFailure as exc:
        encoding_state = exc.state
        encoding_detail = exc.message
    finally:
        invalid_utf8_path.unlink(missing_ok=True)
    add("invalid-utf8", "HOLD_ENCODING", encoding_state, encoding_detail)

    all_passed = all(case["passed"] for case in cases)
    result = {
        "protocol": "LEIS Transport and Local Retrieval v0.3",
        "case_count": len(cases),
        "all_passed": all_passed,
        "cases": cases,
        "non_claims": [
            "Tests verify deterministic local envelope and retrieval behaviour only.",
            "No semantic understanding, network transport, authentication, latency, privacy, or legal compliance is proven."
        ]
    }
    return result, all_passed


def write_json(path: str | Path, value: dict[str, Any]) -> None:
    Path(path).write_text(json.dumps(value, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def main() -> int:
    try:
        if len(sys.argv) == 5 and sys.argv[1] == "ping":
            result = resolve_ping(load_utf8(sys.argv[2]), load_utf8(sys.argv[3]))
            write_json(sys.argv[4], result)
            print(json.dumps({"state": result["state"], "output": sys.argv[4]}, indent=2))
            return 0 if result["state"] == "CANDIDATE_DATA_REVIEW" else 1
        if len(sys.argv) == 4 and sys.argv[1] == "check-pong":
            result = check_pong(load_utf8(sys.argv[2]), load_utf8(sys.argv[3]))
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return 0 if result["state"] == "CANDIDATE_DATA_REVIEW" else 1
        if len(sys.argv) == 3 and sys.argv[1] == "validate-capsule":
            errors = validate_capsule(load_utf8(sys.argv[2]))
            print(json.dumps({"state": "PASS" if not errors else "HOLD_SCHEMA", "errors": errors}, indent=2))
            return 0 if not errors else 1
        if len(sys.argv) == 3 and sys.argv[1] == "validate-bridge":
            errors = validate_bridge(load_utf8(sys.argv[2]))
            print(json.dumps({"state": "PASS" if not errors else "HOLD_SCHEMA", "errors": errors}, indent=2))
            return 0 if not errors else 1
        if len(sys.argv) == 3 and sys.argv[1] == "validate-seed":
            errors = validate_seed(load_utf8(sys.argv[2]))
            print(json.dumps({"state": "PASS" if not errors else "HOLD_SCHEMA", "errors": errors}, indent=2))
            return 0 if not errors else 1
        if len(sys.argv) == 3 and sys.argv[1] == "validate-report":
            errors = validate_report(load_utf8(sys.argv[2]))
            print(json.dumps({"state": "PASS" if not errors else "HOLD_REVIEW", "errors": errors}, indent=2))
            return 0 if not errors else 1
        if len(sys.argv) == 2 and sys.argv[1] == "self-test":
            result, passed = self_test()
            output = Path("results/leis-transport-v0.3-self-test.json")
            output.parent.mkdir(exist_ok=True)
            write_json(output, result)
            print(json.dumps({"all_passed": passed, "case_count": result["case_count"], "output": str(output)}, indent=2))
            return 0 if passed else 1
    except InputFailure as exc:
        print(json.dumps({"state": exc.state, "error": exc.message, "external_action_performed": False}, indent=2))
        return 1
    print("Usage: leis_transport_v0_3.py ping PING INDEX OUTPUT | check-pong PING PONG | validate-capsule FILE | validate-bridge FILE | validate-seed FILE | validate-report FILE | self-test")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
