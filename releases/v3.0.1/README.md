# LEIS Portable Kernel v3.0.1

LEIS is an open, human-governed method for carrying bounded meaning, evidence coordinates, lineage, unknowns, and safe next actions between people and tools.

This is the first public release of the v3 Kernel line. The v3.0.1 protocol contract is unchanged from the frozen local v3.0.0 baseline; the version delta records public licensing and release metadata.

## Start here

1. Read `LEIS-PORTABLE-KERNEL-V3.0.1.md`.
2. Read `LEIS-PUBLIC-WHITEPAPER-V1.0.md` and `LEIS-MATHEMATICAL-AND-CLAIMS-BOUNDARY-V1.0.md` together.
3. Verify the package files against `MANIFEST.json`.
4. Run the local conformance suite:

```text
python tools/leis_release_suite_v301.py
```

The recorded release result is 98 passed cases out of 98 deterministic local protocol cases. The suite covers the bounded Hopper, local retrieval, policy profile, Socratic compatibility checks, and a loopback-only Network Security Officer.

## What the result means

It means the shipped reference implementation passed its declared local test cases in the inspected environment and again from an extracted release package.

It does not prove identical internal understanding, universal Hopper reliability, truth, legal compliance, privacy compliance, scientific validity, a public AI network, or autonomous communication between services.

## Licences

- Reference code and JSON schemas: Apache License 2.0.
- Original LEIS documentation: Creative Commons Attribution 4.0 International.
- Names, marks, and third-party material are excluded unless stated separately.

Suggested documentation attribution:

```text
LEIS documentation by Martin Puzik, licensed under CC BY 4.0.
Changes were made: yes/no.
```

## Safety boundary

The package does not read credentials, password managers, other chats, or arbitrary devices. The reference network component binds to `127.0.0.1` only. Publication, deployment, legal filing, and external actions remain human decisions.

## Integrity

SHA-256 hashes identify exact bytes. They do not identify a trusted owner by themselves and are not a digital signature. Use the release manifest and the public release page together.

