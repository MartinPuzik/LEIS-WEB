#!/usr/bin/env python3
"""LEIS Understanding Hopper v0.2 local structural validator.

The validator checks protocol structure, OFFER binding, critical-anchor recovery,
claim review coverage, and declared safety/evidence conflicts. It does not prove
semantic equivalence, authenticity, or a network transfer.
"""

from __future__ import annotations

import copy
import hashlib
import json
import sys
from pathlib import Path
from typing import Any


PROTOCOL_VERSION = "0.2"
LABELS = {"VERIFIED", "REPORTED", "INTERPRETATION", "HYPOTHESIS", "UNKNOWN", "REJECTED"}
OUTCOMES = {"preserved", "challenged", "unresolved"}
RECEIVER_FIELDS = {"model", "memory", "tools", "web", "source_access"}


def load(path: str | Path) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def canonical_offer_bytes(offer: dict[str, Any]) -> bytes:
    return json.dumps(offer, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("ascii")


def offer_digest(offer: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_offer_bytes(offer)).hexdigest()


def duplicates(values: list[str]) -> list[str]:
    seen: set[str] = set()
    repeated: set[str] = set()
    for value in values:
        if value in seen:
            repeated.add(value)
        seen.add(value)
    return sorted(repeated)


def nonempty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def required_anchor_objects(offer: dict[str, Any]) -> list[dict[str, str]]:
    objects: list[dict[str, str]] = []
    for item in offer.get("critical_anchors", []):
        objects.append({"id": item.get("id", ""), "object_type": "critical_anchor", "meaning": item.get("meaning", "")})
    for item in offer.get("unknowns", []):
        objects.append({"id": item.get("id", ""), "object_type": "unknown", "meaning": item.get("meaning", "")})
    action = offer.get("next_action", {})
    if action:
        objects.append({"id": action.get("id", ""), "object_type": "next_action", "meaning": action.get("meaning", "")})
    return objects


def offer_errors(offer: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    required = {
        "protocol_version", "offer_id", "offer_nonce", "space", "task", "source_manifest",
        "claims", "critical_anchors", "unknowns", "next_action", "boundary", "non_claims"
    }
    missing = sorted(required - set(offer))
    if missing:
        errors.append("offer missing fields: " + ", ".join(missing))
    extra = sorted(set(offer) - required)
    if extra:
        errors.append("offer has unknown fields: " + ", ".join(extra))
    if offer.get("protocol_version") != PROTOCOL_VERSION:
        errors.append("offer protocol_version must be 0.2")
    for field in ("offer_id", "space", "task"):
        if not nonempty_string(offer.get(field)):
            errors.append(f"offer {field} must be a non-empty string")
    if not nonempty_string(offer.get("offer_nonce")) or len(str(offer.get("offer_nonce", ""))) < 8:
        errors.append("offer_nonce must contain at least 8 characters")

    sources = offer.get("source_manifest", [])
    claims = offer.get("claims", [])
    anchors = offer.get("critical_anchors", [])
    unknowns = offer.get("unknowns", [])
    if not all(isinstance(value, list) for value in (sources, claims, anchors, unknowns, offer.get("boundary"), offer.get("non_claims"))):
        errors.append("offer collection fields must be arrays")
        return errors

    source_ids = [item.get("id", "") for item in sources if isinstance(item, dict)]
    claim_ids = [item.get("id", "") for item in claims if isinstance(item, dict)]
    anchor_ids = [item.get("id", "") for item in anchors if isinstance(item, dict)]
    unknown_ids = [item.get("id", "") for item in unknowns if isinstance(item, dict)]
    action_id = offer.get("next_action", {}).get("id", "") if isinstance(offer.get("next_action"), dict) else ""

    for name, values in (("source", source_ids), ("claim", claim_ids), ("anchor", anchor_ids), ("unknown", unknown_ids)):
        if any(not nonempty_string(value) for value in values):
            errors.append(f"{name} IDs must be non-empty")
        repeated = duplicates(values)
        if repeated:
            errors.append(f"duplicate {name} IDs: {', '.join(repeated)}")
    all_recovery_ids = anchor_ids + unknown_ids + ([action_id] if action_id else [])
    repeated_recovery = duplicates(all_recovery_ids)
    if repeated_recovery:
        errors.append("IDs collide across recovery object types: " + ", ".join(repeated_recovery))
    if not action_id:
        errors.append("next_action.id must be non-empty")

    source_id_set = set(source_ids)
    for claim in claims:
        if not isinstance(claim, dict):
            errors.append("each claim must be an object")
            continue
        if claim.get("label") not in LABELS:
            errors.append(f"claim {claim.get('id', '?')} has invalid label")
        refs = claim.get("source_refs")
        if not isinstance(refs, list):
            errors.append(f"claim {claim.get('id', '?')} source_refs must be an array")
            continue
        unknown_refs = sorted(set(refs) - source_id_set)
        if unknown_refs:
            errors.append(f"claim {claim.get('id', '?')} references unknown sources: {', '.join(unknown_refs)}")
        if claim.get("label") == "VERIFIED" and not refs:
            errors.append(f"VERIFIED claim {claim.get('id', '?')} requires at least one source reference")
    return errors


def receipt_errors(receipt: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    required = {
        "protocol_version", "receipt_id", "offer_id", "offer_nonce", "offer_digest_sha256",
        "receiver_conditions", "new_sources", "recovered", "claim_reviews", "declared_gaps", "conflicts",
        "unsupported_claims", "requested_external_actions"
    }
    missing = sorted(required - set(receipt))
    if missing:
        errors.append("receipt missing fields: " + ", ".join(missing))
    extra = sorted(set(receipt) - required)
    if extra:
        errors.append("receipt has unknown fields: " + ", ".join(extra))
    for field in ("receipt_id", "offer_id", "offer_nonce", "offer_digest_sha256"):
        if not nonempty_string(receipt.get(field)):
            errors.append(f"receipt {field} must be a non-empty string")
    conditions = receipt.get("receiver_conditions")
    if not isinstance(conditions, dict):
        errors.append("receiver_conditions must be an object")
    else:
        missing_conditions = sorted(RECEIVER_FIELDS - set(conditions))
        if missing_conditions:
            errors.append("receiver_conditions missing: " + ", ".join(missing_conditions))
        extra_conditions = sorted(set(conditions) - RECEIVER_FIELDS)
        if extra_conditions:
            errors.append("receiver_conditions has unknown fields: " + ", ".join(extra_conditions))
        for field in RECEIVER_FIELDS:
            if field in conditions and not nonempty_string(conditions[field]):
                errors.append(f"receiver_conditions.{field} must be a non-empty string")
    for field in ("new_sources", "recovered", "claim_reviews", "declared_gaps", "conflicts", "unsupported_claims", "requested_external_actions"):
        if not isinstance(receipt.get(field), list):
            errors.append(f"receipt {field} must be an array")
    if errors:
        return errors

    for source in receipt["new_sources"]:
        if not isinstance(source, dict):
            errors.append("every new source must be an object")
            continue
        required_source = {"id", "kind", "locator", "inspected"}
        optional_source = {"sha256"}
        missing_source = sorted(required_source - set(source))
        extra_source = sorted(set(source) - required_source - optional_source)
        if missing_source:
            errors.append("new source missing fields: " + ", ".join(missing_source))
        if extra_source:
            errors.append("new source has unknown fields: " + ", ".join(extra_source))
        if not nonempty_string(source.get("id")) or not nonempty_string(source.get("locator")):
            errors.append("new source id and locator must be non-empty strings")
        if source.get("kind") not in {"local_file", "public_url", "user_report", "test_result"}:
            errors.append(f"new source {source.get('id', '?')} has invalid kind")
        if not isinstance(source.get("inspected"), bool):
            errors.append(f"new source {source.get('id', '?')} inspected must be boolean")

    recovered_ids = [item.get("id", "") for item in receipt["recovered"] if isinstance(item, dict)]
    claim_review_ids = [item.get("id", "") for item in receipt["claim_reviews"] if isinstance(item, dict)]
    for name, values in (("recovered", recovered_ids), ("claim review", claim_review_ids)):
        repeated = duplicates(values)
        if repeated:
            errors.append(f"duplicate {name} IDs: {', '.join(repeated)}")
    for item in receipt["recovered"]:
        if not isinstance(item, dict) or not nonempty_string(item.get("id")) or not nonempty_string(item.get("meaning_in_receiver_words")):
            errors.append("every recovered object requires id and meaning_in_receiver_words")
        elif set(item) != {"id", "meaning_in_receiver_words"}:
            errors.append(f"recovered object {item.get('id', '?')} has unknown or missing fields")
    for review in receipt["claim_reviews"]:
        if not isinstance(review, dict):
            errors.append("every claim review must be an object")
            continue
        required_review = {"id", "outcome", "receiver_label", "rationale", "source_refs"}
        if set(review) != required_review:
            errors.append(f"claim review {review.get('id', '?')} has unknown or missing fields")
        if review.get("outcome") not in OUTCOMES:
            errors.append(f"claim review {review.get('id', '?')} has invalid outcome")
        if review.get("receiver_label") not in LABELS:
            errors.append(f"claim review {review.get('id', '?')} has invalid receiver_label")
        if not nonempty_string(review.get("rationale")):
            errors.append(f"claim review {review.get('id', '?')} requires rationale")
        if not isinstance(review.get("source_refs"), list):
            errors.append(f"claim review {review.get('id', '?')} source_refs must be an array")
    return errors


def bind_receipt(offer: dict[str, Any], template: dict[str, Any]) -> dict[str, Any]:
    receipt = copy.deepcopy(template)
    receipt["protocol_version"] = PROTOCOL_VERSION
    receipt["offer_id"] = offer.get("offer_id")
    receipt["offer_nonce"] = offer.get("offer_nonce")
    receipt["offer_digest_sha256"] = offer_digest(offer)
    return receipt


def check(offer: dict[str, Any], receipt: dict[str, Any]) -> dict[str, Any]:
    schema_errors = offer_errors(offer) + receipt_errors(receipt)
    digest = offer_digest(offer)
    integrity_errors: list[str] = []
    if receipt.get("protocol_version") != offer.get("protocol_version"):
        integrity_errors.append("protocol_version mismatch")
    if receipt.get("offer_id") != offer.get("offer_id"):
        integrity_errors.append("offer_id mismatch")
    if receipt.get("offer_nonce") != offer.get("offer_nonce"):
        integrity_errors.append("offer_nonce mismatch")
    if receipt.get("offer_digest_sha256") != digest:
        integrity_errors.append("offer digest mismatch")

    required_objects = required_anchor_objects(offer)
    required_ids = {item["id"] for item in required_objects}
    recovered_ids = {
        item.get("id") for item in receipt.get("recovered", [])
        if isinstance(item, dict) and nonempty_string(item.get("id")) and nonempty_string(item.get("meaning_in_receiver_words"))
    }
    unknown_recovered_ids = sorted(recovered_ids - required_ids)
    if unknown_recovered_ids:
        schema_errors.append("receipt recovered unknown IDs: " + ", ".join(unknown_recovered_ids))
    missing_ids = sorted(required_ids - recovered_ids)

    offer_claims = {item.get("id"): item for item in offer.get("claims", []) if isinstance(item, dict) and item.get("id")}
    receipt_reviews = {item.get("id"): item for item in receipt.get("claim_reviews", []) if isinstance(item, dict) and item.get("id")}
    unknown_claim_ids = sorted(set(receipt_reviews) - set(offer_claims))
    if unknown_claim_ids:
        schema_errors.append("receipt reviewed unknown claim IDs: " + ", ".join(unknown_claim_ids))
    missing_claim_reviews = sorted(set(offer_claims) - set(receipt_reviews))

    offer_source_ids = {item.get("id") for item in offer.get("source_manifest", []) if isinstance(item, dict)}
    new_source_ids = [item.get("id", "") for item in receipt.get("new_sources", []) if isinstance(item, dict)]
    repeated_new_sources = duplicates(new_source_ids)
    if repeated_new_sources:
        schema_errors.append("duplicate receiver source IDs: " + ", ".join(repeated_new_sources))
    colliding_sources = sorted(set(new_source_ids) & offer_source_ids)
    if colliding_sources:
        schema_errors.append("receiver source IDs collide with offer source IDs: " + ", ".join(colliding_sources))
    source_ids = offer_source_ids | set(new_source_ids)
    claim_issues: list[str] = []
    for claim_id, claim in offer_claims.items():
        review = receipt_reviews.get(claim_id)
        if not review:
            continue
        unknown_refs = sorted(set(review.get("source_refs", [])) - source_ids)
        if unknown_refs:
            schema_errors.append(f"claim review {claim_id} references unknown sources: {', '.join(unknown_refs)}")
        if review.get("outcome") == "challenged":
            claim_issues.append(f"claim {claim_id} challenged")
        if review.get("outcome") == "unresolved" and claim.get("critical"):
            claim_issues.append(f"critical claim {claim_id} unresolved")
        if review.get("receiver_label") != claim.get("label"):
            claim_issues.append(f"claim {claim_id} label changed from {claim.get('label')} to {review.get('receiver_label')}")
    if missing_claim_reviews:
        claim_issues.append("missing claim reviews: " + ", ".join(missing_claim_reviews))
    if receipt.get("conflicts"):
        claim_issues.append("receiver declared conflicts")

    evidence_safety_errors: list[str] = []
    if receipt.get("unsupported_claims"):
        evidence_safety_errors.append("receiver reported unsupported claims")
    if receipt.get("requested_external_actions"):
        evidence_safety_errors.append("receiver requested external actions")

    if schema_errors:
        state = "HOLD_SCHEMA"
    elif integrity_errors:
        state = "HOLD_INTEGRITY"
    elif evidence_safety_errors:
        state = "HOLD_EVIDENCE_OR_SAFETY"
    elif claim_issues:
        state = "HOLD_CLAIM_RECONCILIATION"
    elif missing_ids:
        state = "HOLD_MISSING_CRITICAL"
    else:
        state = "CANDIDATE_SEMANTIC_REVIEW"

    patch_objects = []
    if state == "HOLD_MISSING_CRITICAL":
        patch_objects = [item for item in required_objects if item["id"] in missing_ids]

    condition_values = receipt.get("receiver_conditions", {})
    known_conditions = sum(1 for key in RECEIVER_FIELDS if str(condition_values.get(key, "unknown")).lower() != "unknown")
    return {
        "protocol": "LEIS Understanding Hopper v0.2",
        "offer_id": offer.get("offer_id"),
        "receipt_id": receipt.get("receipt_id"),
        "offer_digest_sha256": digest,
        "state": state,
        "metrics": {
            "critical_anchor_recovery": f"{len(required_ids) - len(missing_ids)}/{len(required_ids)}",
            "claim_review_coverage": f"{len(set(receipt_reviews) & set(offer_claims))}/{len(offer_claims)}",
            "receiver_condition_visibility": f"{known_conditions}/{len(RECEIVER_FIELDS)}"
        },
        "missing_ids": missing_ids,
        "missing_claim_reviews": missing_claim_reviews,
        "schema_errors": sorted(set(schema_errors)),
        "integrity_errors": integrity_errors,
        "claim_issues": claim_issues,
        "evidence_safety_errors": evidence_safety_errors,
        "patch": {
            "protocol_version": PROTOCOL_VERSION,
            "offer_id": offer.get("offer_id"),
            "offer_digest_sha256": digest,
            "missing_objects": patch_objects
        } if patch_objects else None,
        "human_semantic_review_required": state == "CANDIDATE_SEMANTIC_REVIEW",
        "semantic_equivalence_proven": False,
        "external_action_performed": False,
        "limitations": [
            "Digest binding does not authenticate sender identity.",
            "Exact same-offer receipt replay is not detectable without a receipt registry.",
            "Structural recovery does not prove semantic equivalence."
        ]
    }


def self_test() -> tuple[dict[str, Any], bool]:
    offer = load("fixtures/hopper-v0.2-offer-001.json")
    template = load("fixtures/hopper-v0.2-receipt-complete.template.json")
    complete = bind_receipt(offer, template)

    cases: list[tuple[str, dict[str, Any], str]] = []
    cases.append(("complete", complete, "CANDIDATE_SEMANTIC_REVIEW"))

    missing = copy.deepcopy(complete)
    missing["receipt_id"] = "R-V02-MISSING"
    missing["recovered"] = missing["recovered"][:-1]
    cases.append(("missing-critical", missing, "HOLD_MISSING_CRITICAL"))

    bad_digest = copy.deepcopy(complete)
    bad_digest["receipt_id"] = "R-V02-DIGEST"
    bad_digest["offer_digest_sha256"] = "0" * 64
    cases.append(("digest-mismatch", bad_digest, "HOLD_INTEGRITY"))

    bad_version = copy.deepcopy(complete)
    bad_version["receipt_id"] = "R-V02-VERSION"
    bad_version["protocol_version"] = "0.1"
    cases.append(("version-mismatch", bad_version, "HOLD_INTEGRITY"))

    duplicate = copy.deepcopy(complete)
    duplicate["receipt_id"] = "R-V02-DUPLICATE"
    duplicate["recovered"].append(copy.deepcopy(duplicate["recovered"][0]))
    cases.append(("duplicate-id", duplicate, "HOLD_SCHEMA"))

    unsupported = copy.deepcopy(complete)
    unsupported["receipt_id"] = "R-V02-UNSUPPORTED"
    unsupported["unsupported_claims"] = ["Universal zero-loss reconstruction is proven."]
    cases.append(("unsupported-claim", unsupported, "HOLD_EVIDENCE_OR_SAFETY"))

    external = copy.deepcopy(complete)
    external["receipt_id"] = "R-V02-EXTERNAL"
    external["requested_external_actions"] = ["Publish the result."]
    cases.append(("external-action", external, "HOLD_EVIDENCE_OR_SAFETY"))

    challenged = copy.deepcopy(complete)
    challenged["receipt_id"] = "R-V02-CHALLENGE"
    challenged["claim_reviews"][1]["outcome"] = "challenged"
    challenged["claim_reviews"][1]["rationale"] = "The result does not establish a completed universal Hopper."
    cases.append(("challenged-claim", challenged, "HOLD_CLAIM_RECONCILIATION"))

    relabelled = copy.deepcopy(complete)
    relabelled["receipt_id"] = "R-V02-RELABEL"
    relabelled["claim_reviews"][0]["receiver_label"] = "INTERPRETATION"
    cases.append(("silent-relabel", relabelled, "HOLD_CLAIM_RECONCILIATION"))

    missing_conditions = copy.deepcopy(complete)
    missing_conditions["receipt_id"] = "R-V02-CONDITIONS"
    del missing_conditions["receiver_conditions"]["model"]
    cases.append(("missing-receiver-condition", missing_conditions, "HOLD_SCHEMA"))

    unknown_field = copy.deepcopy(complete)
    unknown_field["receipt_id"] = "R-V02-UNKNOWN-FIELD"
    unknown_field["hidden_memory"] = "not-permitted"
    cases.append(("unknown-top-level-field", unknown_field, "HOLD_SCHEMA"))

    new_source_challenge = copy.deepcopy(complete)
    new_source_challenge["receipt_id"] = "R-V02-NEW-SOURCE"
    new_source_challenge["new_sources"] = [{
        "id": "SRC-RECEIVER-NEW",
        "kind": "public_url",
        "locator": "https://example.invalid/receiver-evidence",
        "inspected": True
    }]
    new_source_challenge["claim_reviews"][1]["outcome"] = "challenged"
    new_source_challenge["claim_reviews"][1]["rationale"] = "The receiver reports contrary evidence for human reconciliation."
    new_source_challenge["claim_reviews"][1]["source_refs"].append("SRC-RECEIVER-NEW")
    cases.append(("new-source-challenge", new_source_challenge, "HOLD_CLAIM_RECONCILIATION"))

    results = []
    all_passed = True
    for name, receipt, expected in cases:
        actual = check(offer, receipt)
        passed = actual["state"] == expected
        all_passed = all_passed and passed
        results.append({"case": name, "expected": expected, "actual": actual["state"], "passed": passed, "details": actual})

    output = {
        "protocol": "LEIS Understanding Hopper v0.2",
        "all_passed": all_passed,
        "case_count": len(results),
        "cases": results,
        "non_claim": "These deterministic tests verify local structural and fail-closed behaviour only."
    }
    return output, all_passed


def main() -> int:
    if len(sys.argv) == 3 and sys.argv[1] == "digest":
        print(offer_digest(load(sys.argv[2])))
        return 0
    if len(sys.argv) == 5 and sys.argv[1] == "bind":
        bound = bind_receipt(load(sys.argv[2]), load(sys.argv[3]))
        Path(sys.argv[4]).write_text(json.dumps(bound, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
        print(sys.argv[4])
        return 0
    if len(sys.argv) == 4 and sys.argv[1] == "check":
        result = check(load(sys.argv[2]), load(sys.argv[3]))
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 0 if result["state"] == "CANDIDATE_SEMANTIC_REVIEW" else 1
    if len(sys.argv) == 2 and sys.argv[1] == "self-test":
        result, passed = self_test()
        output = Path("results/leis-hopper-v0.2-self-test.json")
        output.parent.mkdir(exist_ok=True)
        output.write_text(json.dumps(result, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
        print(json.dumps({"all_passed": passed, "case_count": result["case_count"], "output": str(output)}, indent=2))
        return 0 if passed else 1
    print("Usage: leis_hopper_v0_2.py digest OFFER | bind OFFER TEMPLATE OUTPUT | check OFFER RECEIPT | self-test")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
