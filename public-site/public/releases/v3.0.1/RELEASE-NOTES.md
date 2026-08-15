# LEIS Portable Kernel v3.0.1 Release Notes

Date: 2026-08-15
Release class: public, evidence-bounded reference release

## Delta from v3.0.0

- Added Apache-2.0 for reference code and JSON schemas.
- Added CC BY 4.0 for original LEIS documentation.
- Added a public notice, pack index, release metadata, and machine-readable discovery record.
- Removed private, family, foundation, and internal approval records from the distributed pack.
- Preserved the v3.0.0 protocol contract and all prior frozen artifacts unchanged.

## Test evidence

The v3.0.1 suite reruns the same reference protocol behavior under the new release coordinate:

- 98 deterministic local cases;
- 98 passed in the release build environment;
- fresh extraction and manifest verification required before publication.

Covered: Hopper structures and gates, local retrieval, Policy Profile, bounded Socratic compatibility, strict JSON and replay handling, and a `127.0.0.1` Network Security Officer.

Not covered: model-independent semantic identity, external networks, public connectors, legal compliance, privacy certification, scientific proof, universal reliability, or autonomous execution.

## Compatibility

v3.0.1 is protocol-compatible with v3.0.0. The version change exists because a frozen artifact is never silently relicensed or rewritten.

