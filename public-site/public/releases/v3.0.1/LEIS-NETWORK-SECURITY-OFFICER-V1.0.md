# LEIS Network Security Officer v1.0

Status: local verified prototype
Version: 1.0
Date: 2026-08-15

## Purpose

The Network Security Officer is a small local boundary around the Universal Hopper. It accepts a bounded RECEIPT, resolves the matching retained OFFER and private control material locally, applies optional policy gates, returns PATCH/ACK/HOLD, and records only minimal audit metadata.

It converts the idea of a LEIS Network into a testable local handshake. It is not an internet deployment.

## Local flow

```text
Receiver
  -> POST /v1/receipt on 127.0.0.1
  -> UTF-8, JSON, size and duplicate-key gates
  -> OFFER lookup by exact ID
  -> optional policy-profile gate
  -> Universal Hopper validation against retained U0 control
  -> PATCH, ACK or HOLD
  -> metadata-only audit event
```

## Security decisions

- The server refuses non-loopback binding.
- It does not expose U0, expected answers, credentials, or unrestricted file access.
- Every RECEIPT remains bound to OFFER ID, nonce, digest, attempt, and declared receiver conditions.
- Duplicate JSON keys, UTF-8 BOM, malformed JSON, unknown fields, oversized bodies, replay, and unsafe external-action requests fail closed.
- Imported prompt-like text remains inert data. It is not executed merely because it appears in a payload.
- Optional legal, employment, and privacy checks are metadata gates; they do not certify compliance.
- Audit events contain outcome metadata, not raw RECEIPT content.
- The reference self-test starts on an ephemeral loopback port and shuts the server down after testing.

## Interfaces

### Health

`GET /health`

Returns local mode and version. It does not prove any external node is connected.

### Validate a RECEIPT

`POST /v1/receipt`

```json
{
  "offer_id": "OFFER-UH-001",
  "receipt": {},
  "policy_capsule": {}
}
```

`policy_capsule` is optional. Unknown envelope fields are rejected.

## Operational non-claims

- No public endpoint, cross-machine connection, or autonomous command queue.
- No semantic zero-knowledge proof.
- No identical internal understanding guarantee.
- No legal, privacy, or security certification.
- No universal memory or automatic access to other chats.
- No publication or remote action.

## Reproducible check

Run `tools/leis_network_security_officer_v1.py --self-test`. The result is written to `results/leis-network-security-officer-v1.0-self-test.json`.

