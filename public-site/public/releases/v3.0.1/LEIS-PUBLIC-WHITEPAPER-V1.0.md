# LEIS: Preserving the Path of Understanding

Version: 1.0
Date: 2026-08-15
Status: public candidate; evidence bounded
Creator: Martin Puzik

## Abstract

LEIS is a human-governed protocol for carrying a bounded task and its critical meaning between people, documents, and AI systems. It does not try to save every word. It records what must survive, where it came from, what is uncertain, what action is allowed, and how a new receiver's reconstruction will be checked.

The current reference implementation provides strict message schemas, a blind OFFER/RECEIPT/PATCH/ACK handshake, local validation, optional policy metadata gates, replay protection, and a loopback-only Network Security Officer. A 98-case local suite passes in the prepared workspace. This is evidence of declared protocol behavior, not proof of universal understanding, truth, compliance, or public-network security.

## 1. The problem

Conversations, reports, models, and teams often preserve conclusions but lose the path that made those conclusions safe. Copying more text can also copy errors, private data, contradictions, and obsolete assumptions.

LEIS asks a narrower question:

```text
What is the minimum explicit structure needed for another receiver
to continue the same bounded task without losing critical reality anchors?
```

## 2. The approach

LEIS separates six kinds of material: verified evidence, reported claims, interpretation, hypothesis, unknown, and rejected content. It places work inside explicit Spaces so that private, legal, research, public, and business material cannot silently merge.

A compact Capsule carries:

- task identity;
- critical meanings;
- claim labels and source references;
- lineage and contradictions;
- open unknowns;
- privacy boundary;
- human authority;
- next safe action;
- explicit non-claims.

## 3. The Hopper handshake

1. The sender retains a control object `U0` and publishes only its canonical digest.
2. An OFFER presents the bounded task, public evidence labels, critical objects, choices, and limits.
3. A receiver returns a RECEIPT in its own words and declares its operating conditions and gaps.
4. The validator compares the RECEIPT with the retained control.
5. Missing public context produces the smallest PATCH. Private expected answers remain hidden.
6. The session terminates in ACK, HOLD, or FAIL.

The status `ACCEPTED_OPERATIONAL` means that the declared gates passed for one transaction. It is not a certificate of truth or identical understanding.

## 4. The local Network Security Officer

The first network profile is intentionally local. The reference service binds to `127.0.0.1`, accepts only strict JSON at one RECEIPT endpoint, resolves OFFER and control material locally, rejects replay and unsafe actions, and records metadata-only audit events. The test server uses an ephemeral port and stops automatically.

This makes the handshake observable without claiming internet deployment, hidden access, or autonomous control. Public or cross-device operation is a separate engineering project requiring authentication, ownership, threat modelling, privacy review, and new tests.

## 5. Evidence

The v3.0.0 suite contains 98 deterministic local cases:

- 12 Understanding Hopper cases;
- 16 Transport and Local Retrieval cases;
- 32 Universal Hopper cases;
- 18 Policy Profile cases;
- 6 Socratic compatibility cases;
- 14 Network Security Officer cases.

The tests cover declared schema and binding rules, negative paths, blind control evaluation, PATCH/ACK behavior, replay, external-action holds, and the loopback boundary. Results are reproducible from the packaged source.

## 6. Scientific position

LEIS does not currently possess a universal measure of understanding. The proposed RSS, drift, and Golden Question rubrics are experiment tools that need calibration, baselines, blind raters, uncertainty intervals, adversarial tests, and independent replication.

The phrase "compression may reveal stable invariants that support reconstruction" is a research hypothesis. Zero conditional entropy, guaranteed reconstruction after total erasure, quantum proof, and a universal Stability Axis have not been established.

## 7. Legal and privacy position

LEIS can require provenance, role, jurisdiction, human oversight, contestability, and data-minimization metadata. Those gates help prevent unsupported release claims, but they do not make a system compliant by themselves. GDPR, the EU AI Act, DPIA, FRIA, employment law, and sector rules apply according to the actual actor, intended purpose, data flow, jurisdiction, and system classification.

## 8. Governance

The Creator controls public release and external actions. Frozen versions are never silently overwritten. Every contract change receives a new semantic version and an append-only delta. Contributions retain attribution, limitations, contradictions, and consent boundaries.

Business and client work remains outside LEIS Core unless an explicit Bridge Capsule defines the permitted relationship.

## 9. Public non-claims

LEIS is not an AI model, universal memory, truth oracle, legal authority, scientific proof, autonomous network, or guarantee of lossless reconstruction. The current release does not implement BIP-340 authority, threshold sharding, Hamming privacy, automatic offline local-model fallback, or public cross-provider integration.

## 10. Next research gate

The strongest next study is a preregistered, blinded, multi-receiver comparison against both a full-context baseline and a plain-summary baseline. It should report critical-anchor recovery, rater agreement, error types, privacy leakage, costs, and failure cases. The result should be published whether it supports or weakens the current design.

