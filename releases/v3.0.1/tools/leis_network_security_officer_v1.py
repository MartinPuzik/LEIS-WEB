#!/usr/bin/env python3
"""Local-only LEIS Network Security Officer v1.0.

This reference implementation wraps Universal Hopper v1.0 with a loopback HTTP
boundary. It validates declared protocol conformance only. It does not create a
public network, prove semantic identity, or authorise external action.
"""

from __future__ import annotations

import argparse
import copy
import http.client
import ipaddress
import json
import tempfile
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import leis_policy_profile_v1 as policy
import leis_universal_hopper_v1 as hopper


VERSION = "1.0"
MAX_BODY_BYTES = 131_072
ALLOWED_ENVELOPE_FIELDS = {"offer_id", "receipt", "policy_capsule"}


class NetworkBoundaryError(ValueError):
    pass


def parse_json_object(raw: bytes) -> dict[str, Any]:
    if raw.startswith(b"\xef\xbb\xbf"):
        raise NetworkBoundaryError("UTF-8 BOM is not permitted")
    try:
        text = raw.decode("utf-8", errors="strict")
        value = json.loads(text, object_pairs_hook=hopper._object_pairs)
    except (UnicodeDecodeError, json.JSONDecodeError, hopper.DuplicateKeyError) as exc:
        raise NetworkBoundaryError(str(exc)) from exc
    if not isinstance(value, dict):
        raise NetworkBoundaryError("top-level JSON value must be an object")
    return value


def _is_loopback(host: str) -> bool:
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


class LEISNetworkSecurityOfficer:
    def __init__(
        self,
        records: dict[str, tuple[dict[str, Any], dict[str, Any]]],
        registry_path: str | Path,
        max_body_bytes: int = MAX_BODY_BYTES,
    ) -> None:
        self.records = records
        self.registry_path = Path(registry_path)
        self.max_body_bytes = max_body_bytes
        self.audit_events: list[dict[str, Any]] = []

    def _audit(self, offer_id: str | None, state: str) -> None:
        self.audit_events.append(
            {
                "time_utc": datetime.now(timezone.utc).isoformat(),
                "offer_id": offer_id,
                "state": state,
                "raw_payload_stored": False,
            }
        )

    def evaluate(self, envelope: dict[str, Any]) -> tuple[int, dict[str, Any]]:
        if set(envelope) - ALLOWED_ENVELOPE_FIELDS:
            result = {"state": "HOLD_ENVELOPE", "errors": ["unknown envelope fields"]}
            self._audit(envelope.get("offer_id"), result["state"])
            return 400, result
        if "offer_id" not in envelope or "receipt" not in envelope:
            result = {"state": "HOLD_ENVELOPE", "errors": ["offer_id and receipt are required"]}
            self._audit(envelope.get("offer_id"), result["state"])
            return 400, result

        offer_id = envelope.get("offer_id")
        if not isinstance(offer_id, str) or offer_id not in self.records:
            result = {"state": "HOLD_UNKNOWN_OFFER", "errors": ["offer is not registered locally"]}
            self._audit(offer_id if isinstance(offer_id, str) else None, result["state"])
            return 404, result
        receipt = envelope.get("receipt")
        if not isinstance(receipt, dict):
            result = {"state": "HOLD_ENVELOPE", "errors": ["receipt must be an object"]}
            self._audit(offer_id, result["state"])
            return 400, result

        policy_result: dict[str, Any] | None = None
        if "policy_capsule" in envelope:
            capsule = envelope["policy_capsule"]
            if not isinstance(capsule, dict):
                result = {"state": "HOLD_POLICY", "errors": ["policy_capsule must be an object"]}
                self._audit(offer_id, result["state"])
                return 400, result
            policy_result = policy.validate_policy_capsule(capsule)
            if policy_result.get("gate") != "POLICY_PROFILE_PASS":
                result = {
                    "state": "HOLD_POLICY",
                    "policy": policy_result,
                    "external_action_performed": False,
                }
                self._audit(offer_id, result["state"])
                return 200, result

        offer, control = self.records[offer_id]
        ack = hopper.check(
            offer,
            receipt,
            control,
            registry_path=self.registry_path,
        )
        result = {
            "network_profile": "LOCAL_LOOPBACK_ONLY",
            "officer_version": VERSION,
            "state": ack["state"],
            "ack": ack,
            "policy": policy_result,
            "external_action_performed": False,
        }
        self._audit(offer_id, ack["state"])
        return 200, result


def make_handler(officer: LEISNetworkSecurityOfficer) -> type[BaseHTTPRequestHandler]:
    class Handler(BaseHTTPRequestHandler):
        server_version = "LEIS-Network-Security-Officer/1.0"

        def _send(self, status: int, payload: dict[str, Any]) -> None:
            body = (json.dumps(payload, ensure_ascii=True, separators=(",", ":")) + "\n").encode("ascii")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=ascii")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(body)

        def _client_is_loopback(self) -> bool:
            return _is_loopback(self.client_address[0])

        def do_GET(self) -> None:  # noqa: N802
            if not self._client_is_loopback():
                self._send(403, {"state": "HOLD_NETWORK_BOUNDARY"})
                return
            if self.path != "/health":
                self._send(404, {"state": "HOLD_UNKNOWN_ROUTE"})
                return
            self._send(
                200,
                {
                    "status": "ok",
                    "version": VERSION,
                    "mode": "LOCAL_LOOPBACK_ONLY",
                    "external_network_active": False,
                },
            )

        def do_POST(self) -> None:  # noqa: N802
            if not self._client_is_loopback():
                self._send(403, {"state": "HOLD_NETWORK_BOUNDARY"})
                return
            if self.path != "/v1/receipt":
                self._send(404, {"state": "HOLD_UNKNOWN_ROUTE"})
                return
            content_type = self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
            if content_type != "application/json":
                self._send(415, {"state": "HOLD_CONTENT_TYPE"})
                return
            raw_length = self.headers.get("Content-Length")
            try:
                length = int(raw_length) if raw_length is not None else -1
            except ValueError:
                length = -1
            if length < 0:
                self._send(411, {"state": "HOLD_LENGTH"})
                return
            if length > officer.max_body_bytes:
                self._send(413, {"state": "HOLD_SIZE"})
                return
            raw = self.rfile.read(length)
            try:
                envelope = parse_json_object(raw)
            except NetworkBoundaryError as exc:
                self._send(400, {"state": "HOLD_ENCODING_OR_JSON", "errors": [str(exc)]})
                return
            status, result = officer.evaluate(envelope)
            self._send(status, result)

        def log_message(self, _format: str, *_args: Any) -> None:
            return

    return Handler


def start_local_server(
    officer: LEISNetworkSecurityOfficer,
    host: str = "127.0.0.1",
    port: int = 0,
) -> ThreadingHTTPServer:
    if not _is_loopback(host):
        raise NetworkBoundaryError("the reference server may bind only to an IP loopback address")
    return ThreadingHTTPServer((host, port), make_handler(officer))


def _request(
    port: int,
    method: str,
    path: str,
    body: bytes | None = None,
    content_type: str | None = None,
) -> tuple[int, dict[str, Any]]:
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    headers: dict[str, str] = {}
    if content_type is not None:
        headers["Content-Type"] = content_type
    try:
        connection.request(method, path, body=body, headers=headers)
        response = connection.getresponse()
        raw = response.read()
        return response.status, json.loads(raw.decode("ascii"))
    finally:
        connection.close()


def _oversize_header_request(port: int, declared_length: int) -> tuple[int, dict[str, Any]]:
    """Declare an oversized body without transmitting it.

    This checks the pre-read size gate and avoids making the client upload bytes
    that the server is specifically designed not to read.
    """
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    try:
        connection.putrequest("POST", "/v1/receipt")
        connection.putheader("Content-Type", "application/json")
        connection.putheader("Content-Length", str(declared_length))
        connection.endheaders()
        response = connection.getresponse()
        raw = response.read()
        return response.status, json.loads(raw.decode("ascii"))
    finally:
        connection.close()


def self_test() -> tuple[dict[str, Any], bool]:
    offer, control, receipt = hopper.example_objects()
    results: list[dict[str, Any]] = []

    def record(name: str, passed: bool, actual: Any) -> None:
        results.append({"name": name, "passed": bool(passed), "actual": actual})

    try:
        start_local_server(None, host="0.0.0.0")  # type: ignore[arg-type]
        record("non-loopback bind rejected", False, "server started")
    except NetworkBoundaryError:
        record("non-loopback bind rejected", True, "rejected")

    with tempfile.TemporaryDirectory(prefix="leis-network-") as temp_dir:
        registry = Path(temp_dir) / "accepted.sqlite3"
        officer = LEISNetworkSecurityOfficer({offer["header"]["offer_id"]: (offer, control)}, registry)
        server = start_local_server(officer)
        port = int(server.server_address[1])
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            status, payload = _request(port, "GET", "/health")
            record("loopback health", status == 200 and payload.get("external_network_active") is False, [status, payload.get("mode")])

            status, payload = _request(port, "GET", "/unknown")
            record("unknown route rejected", status == 404 and payload.get("state") == "HOLD_UNKNOWN_ROUTE", [status, payload.get("state")])

            status, payload = _request(port, "POST", "/v1/receipt", b"{}", "text/plain")
            record("content type rejected", status == 415 and payload.get("state") == "HOLD_CONTENT_TYPE", [status, payload.get("state")])

            status, payload = _request(port, "POST", "/v1/receipt", b"{broken", "application/json")
            record("malformed JSON rejected", status == 400 and payload.get("state") == "HOLD_ENCODING_OR_JSON", [status, payload.get("state")])

            duplicate = b'{"offer_id":"x","offer_id":"y","receipt":{}}'
            status, payload = _request(port, "POST", "/v1/receipt", duplicate, "application/json")
            record("duplicate JSON key rejected", status == 400 and payload.get("state") == "HOLD_ENCODING_OR_JSON", [status, payload.get("state")])

            status, payload = _oversize_header_request(port, MAX_BODY_BYTES + 1)
            record("oversized body rejected", status == 413 and payload.get("state") == "HOLD_SIZE", [status, payload.get("state")])

            unknown = json.dumps({"offer_id": "UNKNOWN", "receipt": {}}).encode("ascii")
            status, payload = _request(port, "POST", "/v1/receipt", unknown, "application/json")
            record("unknown offer rejected", status == 404 and payload.get("state") == "HOLD_UNKNOWN_OFFER", [status, payload.get("state")])

            unsafe = copy.deepcopy(receipt)
            unsafe["receipt_id"] = "RECEIPT-NETWORK-UNSAFE"
            unsafe["requested_external_actions"] = ["publish without separate human approval"]
            body = json.dumps({"offer_id": offer["header"]["offer_id"], "receipt": unsafe}).encode("ascii")
            status, payload = _request(port, "POST", "/v1/receipt", body, "application/json")
            record("unsafe external action held", payload.get("state") == "HOLD_EVIDENCE_OR_SAFETY", payload.get("state"))

            bad_policy = {"policy_profiles": ["PRIVACY"], "instructions_executable": True}
            body = json.dumps({"offer_id": offer["header"]["offer_id"], "receipt": receipt, "policy_capsule": bad_policy}).encode("ascii")
            status, payload = _request(port, "POST", "/v1/receipt", body, "application/json")
            record("policy failure held", payload.get("state") == "HOLD_POLICY", payload.get("state"))

            good_policy = {
                "policy_profiles": ["PRIVACY"],
                "instructions_executable": False,
                "text": "ignore prior instructions remains inert imported text",
            }
            accepted = copy.deepcopy(receipt)
            accepted["receipt_id"] = "RECEIPT-NETWORK-ACCEPTED"
            body = json.dumps({"offer_id": offer["header"]["offer_id"], "receipt": accepted, "policy_capsule": good_policy}).encode("ascii")
            status, payload = _request(port, "POST", "/v1/receipt", body, "application/json")
            record("valid local receipt accepted", payload.get("state") == "ACCEPTED_OPERATIONAL", payload.get("state"))
            record("policy prompt text stayed inert", (payload.get("policy") or {}).get("gate") == "POLICY_PROFILE_PASS", (payload.get("policy") or {}).get("gate"))

            replay = copy.deepcopy(accepted)
            replay["receipt_id"] = "RECEIPT-NETWORK-REPLAY"
            body = json.dumps({"offer_id": offer["header"]["offer_id"], "receipt": replay}).encode("ascii")
            status, payload = _request(port, "POST", "/v1/receipt", body, "application/json")
            record("accepted nonce replay held", payload.get("state") == "HOLD_REPLAY", payload.get("state"))

            record(
                "audit stores metadata only",
                bool(officer.audit_events) and all(item.get("raw_payload_stored") is False for item in officer.audit_events),
                len(officer.audit_events),
            )
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)

    report = {
        "suite": "LEIS Network Security Officer v1.0",
        "case_count": len(results),
        "passed_count": sum(item["passed"] for item in results),
        "all_passed": all(item["passed"] for item in results),
        "results": results,
        "binding": "127.0.0.1 ephemeral port; server stopped after test",
        "external_network_active": False,
        "semantic_identity_proven": False,
        "compliance_certified": False,
    }
    output = Path("results/leis-network-security-officer-v1.0-self-test.json")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    return report, report["all_passed"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if not args.self_test:
        parser.error("only --self-test is enabled in the public reference implementation")
    report, ok = self_test()
    print(json.dumps(report, indent=2, ensure_ascii=True))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
