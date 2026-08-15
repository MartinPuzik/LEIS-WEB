# LEIS Network Local Activation Receipt

Date: 2026-08-15
Profile: LEIS Network Security Officer v1.0
Result: PASS

## What was activated

The reference server was started on `127.0.0.1` using an ephemeral operating-system-selected port. A local client exercised the health route and the RECEIPT route. The server was then shut down and the port released.

## Result

- 14/14 deterministic network-boundary cases passed.
- A valid local receipt returned `ACCEPTED_OPERATIONAL`.
- Reuse of the accepted OFFER nonce returned `HOLD_REPLAY`.
- Invalid route, content type, JSON, duplicate keys, body size, unknown OFFER, unsafe external action, and failed policy metadata were rejected or held.
- Imported prompt-like text remained inert under the privacy policy profile.
- Audit events stored metadata only, not raw RECEIPT content.
- Non-loopback binding was rejected.

## Shutdown state

```text
external_network_active: false
background_server_running: false
cross_machine_connection_tested: false
public_endpoint_created: false
```

This receipt proves the declared local test behavior only.

