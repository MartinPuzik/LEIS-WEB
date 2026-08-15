# LEIS Ecosystem Final Blueprint v1.1

Date: 2026-08-15
Creator: Martin Puzik
Status: frozen portfolio blueprint baseline

## 1. Purpose of this freeze

This blueprint closes the current concept-expansion cycle. It records the complete project architecture, interfaces, evidence gates, and boundaries so that later work can build deliberately instead of reconstructing intent from chat history.

"Final" means the blueprint baseline is complete enough to scope future builds. It does not mean every product is implemented, deployed, legally approved, or publicly released.

## 2. One ecosystem, explicit Spaces

```text
REALITY AND SOURCES
        |
        v
REALITY SCANNER -> EVIDENCE ATOMS -> HUMAN REVIEW
        |                                  |
        v                                  v
   LEIS SPACES ----------------------> CLAIMS REGISTER
        |
        v
KERNEL -> SEED -> CAPSULE -> HOPPER -> CONNECTOR -> RECEIVER
                                           |
                                           v
                         NETWORK SECURITY OFFICER
                                           |
                                           v
                          RECEIPT -> VALIDATE -> PATCH/ACK
                                           |
                                           v
                           LINEAGE DELTA -> RELEASE GATE
```

Spaces prevent silent mixing. The Kernel defines the portable method. Seeds identify a bounded line of understanding. Capsules carry current state. Hopper validates transfer. Connectors describe explicit paths. The Security Officer enforces the transport boundary. The release gate preserves human authority.

## 3. Common object model

### Seed

Stable identity of one bounded understanding line:

```text
ID | purpose | core principles | evidence anchors | lineage
critical unknowns | Golden Questions | owner | version | status
```

### Capsule

Current portable state linked to a Seed:

```text
Seed reference | task | critical objects | labelled claims | lineage delta
privacy | human authority | next action | non-claims
```

### Connector

Explicit path by which a Capsule can be transferred or resolved:

```text
ID | type | input/output | activation | evidence | trust owner
privacy | failure | recovery | last test | status
```

### Receipt and Patch

The receiver returns meanings in its own words, declared conditions, gaps, conflicts, claim reviews, and action requests. The validator returns the smallest missing public context or a terminal ACK/HOLD/FAIL.

## 4. Portfolio coordinate

| # | Project | Blueprint status | Readiness | Build/research output |
|---:|---|---|---:|---|
| 1 | LEIS Community public hub | paused | 10% | Canonical public directory and contribution entry point. |
| 2 | LEIS Portal stabilization | paused | 15% | Four-language engine baseline, stable UI, honest roadmap. |
| 3 | Seed and Sync verified workflow | paused | 10% | Activation, passkey, second-device transfer, recovery, legacy reconnect. |
| 4 | Portable Kernel + AI Hopper | verified blueprint | 100% | v3.0.1 public Kernel, schemas, validators, local Network Security Officer, reproducible suite. |
| 5 | Public research and legal library | research pack prepared | 55% | Versioned public whitepaper, claims boundary, legal reference, downloads. |
| 6 | LEIS Workspace Companion | paused | 10% | Google Docs-first fact/interpretation/unknown/source review. |
| 7 | Reality Scanner and Memory pipeline | paused/supporting prototype | 35% | Catalogue, classify, extract, atomize, human accept/reject. |
| 8 | LEISNet/Otex feasibility | paused | 15% | Threat-modelled study of offline, mesh, recovery, local execution. |
| 9 | Release integrity feasibility | paused | 20% | Reproducible builds, provenance, signing, custody, recovery. |
| 10 | Privacy-preserving retrieval feasibility | paused | 15% | Security/utility evaluation of 1-bit and Hamming proposals. |
| 11 | Offline continuity prototype | paused | 15% | Sandboxed user-owned local model fallback experiment. |
| 12 | RFI and reproducibility evaluation | paused | 30% | Defined datasets, baselines, independent evidence limits. |
| 13 | LEIS SDK / middleware feasibility | paused | 15% | Minimal developer boundary for user-controlled validation. |
| 14 | Governance and legal classification | research pack prepared | 35% | Role/jurisdiction matrix, DPIA/FRIA preassessment, professional-review gates. |
| 15 | Community governance and contribution policy | paused | 20% | Attribution, moderation, evidence labels, consent, versioning. |
| 16 | Portal delivery and continuity | paused | 42% | Owner of Portal design/build progression and source continuity. |

Percentages measure blueprint readiness, not product completion.

## 5. Project build cards

### P1 - LEIS Community public hub

- Why: give the public one canonical path to Understand, Research, Build, Govern, and Connect.
- User value: avoids scattered, contradictory entry points.
- Inputs: approved Portal copy, public papers, downloads, governance policy.
- Boundary: no item appears because it exists in a chat or draft; release manifest and human approval required.
- Build acceptance: information architecture, owner per section, accessibility, analytics/privacy decision, tested links, versioned downloads, moderation path.
- First safe action: freeze a content inventory after P5 and P15 are reviewed.

### P2 - LEIS Portal stabilization

- Why: repair language and release drift without mixing old language layers.
- User value: predictable four-language experience (EN, CS, DE, RU).
- Current reality: local source and historical tests exist; earlier documentation incorrectly described 17 active languages.
- Boundary: other languages remain prepared candidates, not active, until catalogue and visual/style acceptance tests pass.
- Build acceptance: one global catalogue, missing-key diagnostics, four complete dictionaries, accents/RTL/CJK preparation tests, no page-local legacy maps, complete public assets, full regression pass.
- First safe action: reproduce the six recorded local failures in a clean working copy.

### P3 - Seed and Sync verified workflow

- Why: let users continue safely across activation, devices, and recovery.
- User value: controlled continuity with an observable recovery path.
- Dependencies: Portal, identity/passkey threat model, recovery ownership, audit design.
- Boundary: no claim that V4 Seed, device transfer, or recovery is live until route, UI, security, and end-to-end tests pass.
- Build acceptance: lifecycle state machine, passkey ceremonies, recovery cases, legacy migration, multi-device revocation, privacy analysis, destructive-action confirmations.

### P4 - Portable Kernel + AI Hopper

- Why: preserve bounded meaning and safe action orientation across environments.
- User value: a small, inspectable way to continue work without importing an entire conversation.
- Implemented reference: v3.0.1 public Kernel; OFFER/RECEIPT/PATCH/ACK; local retrieval; optional Policy Profile; Socratic checks; loopback Security Officer.
- Evidence: 98 deterministic local cases in the v3 suite.
- Boundary: local protocol conformance only; no universal semantic identity, autonomous internet, or compliance claim.
- Build acceptance: met for the blueprint and reference local implementation. Future transports are new profiles, not silent Kernel changes.

### P5 - Public research and legal library

- Why: make papers, limitations, citations, and revisions inspectable.
- User value: readers can distinguish tested work from proposals.
- Prepared outputs: public whitepaper, mathematical/claims boundary, legal reference, DPIA/FRIA preassessment, pack index.
- Boundary: no scientific breakthrough, theorem, legal compliance, or public-download claim without exact evidence and live verification.
- Build acceptance: document owner, semantic version, source table, claims audit, independent technical/legal review, accessible downloads, hashes, correction policy.
- First safe action: commissioned review of the public whitepaper and legal Czech/English editions.

### P6 - LEIS Workspace Companion

- Why: bring reality labels into normal document work.
- User value: one-click fact/interpretation/unknown/source review and user-controlled Capsule export.
- First prototype: Google Docs only; selected document/range only.
- Boundary: no Gmail or bulk Drive access; no automatic truth validation.
- Build acceptance: minimal permissions, preview before write, citations retained, undo, export consent, test corpus, privacy notice.

### P7 - Reality Scanner and Memory pipeline

- Why: turn user-selected sources into reviewable evidence candidates.
- User value: sources remain traceable and are not silently promoted to knowledge.
- Pipeline: catalogue -> classify -> explicit read/extract -> evidence atoms -> human review -> accept/reject.
- Current evidence: book intake and extraction prototype; one image-only source remained unread.
- Boundary: no autonomous scan of all drives, no instruction execution, no claim that extracted text is true.
- Build acceptance: allowlisted intake, file hashes, extraction coverage, OCR disclosure, atom schema, human decision ledger, retention/delete rules.

### P8 - LEISNet/Otex feasibility

- Why: independently assess zero-trust, offline, mesh, recovery, and local execution ideas.
- User value: separates ambitious network research from Portal claims.
- Boundary: no live LEISNet, NAS, mesh, SSH, or cross-machine operation in the current project.
- Build acceptance: explicit threat model, node/owner model, adversary cases, offline semantics, recovery proof, cost/performance tests, independent security review.

### P9 - Release integrity feasibility

- Why: users must know which artifact and owner they are trusting.
- User value: reproducible, tamper-evident release coordinates.
- Current reality: SHA-256 manifests exist; optional Ed25519 verification is implemented against an external trust store.
- Boundary: hashes prove content identity only; no public key is a root of trust without ownership and recovery governance.
- Build acceptance: reproducible package, SBOM/dependencies, signature policy, hardware/key custody option, rotation/revocation, compromise recovery, independent review.

### P10 - Privacy-preserving retrieval feasibility

- Why: test whether compact retrieval can reduce exposure without destroying utility.
- User value: measured privacy/utility trade-offs.
- Boundary: no GDPR, non-invertibility, Hamming, 1-bit, or model-inversion resistance claim without a defined attacker and experiment.
- Build acceptance: dataset, adjacency/threat model, leakage attacks, utility baselines, parameter disclosure, uncertainty, independent privacy review.

### P11 - Offline continuity prototype

- Why: allow bounded local work during cloud failure.
- User value: user-owned continuity without autonomous remote control.
- Boundary: no current `llama.cpp` fallback or equivalent is claimed.
- Build acceptance: supported hardware, sandbox, model provenance/licence, resource limits, offline test, data deletion, no network by default, explicit human start/stop.

### P12 - RFI and reproducibility evaluation

- Why: measure candidate reconstruction behavior honestly.
- User value: comparisons include baselines and failure cases.
- Boundary: RFI/RSS/RTS/LDS/GQS are task-specific research metrics until calibrated.
- Build acceptance: preregistration, datasets, full-context and plain-summary baselines, blinded independent raters, agreement statistics, privacy leakage, cost/latency, published negative results.

### P13 - LEIS SDK / middleware feasibility

- Why: let developers call a user-controlled validation workflow without importing LEIS mythology.
- User value: small integration surface and predictable failure states.
- Boundary: no automatic truth validator, compliance engine, or autonomous external action.
- Build acceptance: transport-neutral data types, validation API, error codes, examples, conformance kit, threat model, version negotiation, least-privilege adapters.

### P14 - Governance and legal classification

- Why: distinguish LEIS roles and obligations by actual use.
- User value: fewer false compliance claims and clearer professional-review triggers.
- Prepared outputs: AI Act reference, Digital Life classification, neutral DPIA/FRIA preassessment, Czech foundation-fund pack plan.
- Boundary: no generic PASS; role, intended purpose, jurisdiction, system classification, and data flows must be known.
- Build acceptance: current source register, role matrix, high-risk/applicability analysis, GDPR records, DPIA/FRIA decisions, counsel/DPO sign-off where required.

### P15 - Community governance and contribution policy

- Why: preserve attribution and prevent evidence drift in an open community.
- User value: transparent credit, moderation, corrections, and appeals.
- Boundary: no automatic capture of all account chats or people; consent and data minimization are required.
- Build acceptance: contributor covenant, evidence labels, licence/CLA decision, attribution/events model, moderation/appeal process, security reporting, versioning, privacy and retention policy.

### P16 - Portal delivery and continuity

- Why: give one project explicit ownership of Portal management, design, repair, build, and continuity.
- User value: work can continue across tasks from inspected source and recorded tests.
- Current reality: a substantial local source tree exists; last captured run passed 98/105 with six recorded failures and Git ownership guard prevented a fresh status check.
- Boundary: chat history is not implementation evidence; no deployment or repository change without explicit target approval.
- Build acceptance: trusted working-copy decision, clean test reproduction, P2 language fix, release assets, accessibility/security review, preview approval, deployment/runbook/rollback, live verification.

## 6. Cross-project release gates

Every public or production delivery must define:

- owner and Space;
- exact version and immutable hash;
- source and claims register;
- privacy class and data flow;
- implementation and test evidence;
- known failures and non-claims;
- legal/professional review where applicable;
- licence and third-party rights;
- destination, rollback, and human approval.

## 7. Frozen decisions

- Project 4 v3.0.1 is the current public Kernel coordinate; v3.0.0 remains its immutable local predecessor.
- v2.4.0 and every earlier release remain immutable lineage.
- The four-language Portal baseline is EN, CS, DE, RU; other languages are candidates.
- LEIS Core is isolated from specific business cases.
- The first Network profile is local loopback only.
- Reference code and schemas use Apache-2.0; original public documentation uses CC BY 4.0, by recorded Creator approval.
- Unimplemented BIP-340 authority, threshold sharding, Hamming privacy, offline fallback, and external integrations remain research.
- Legal and scientific claims follow primary evidence, exact scope, and independent review.

## 8. Portfolio restart rule

A paused project restarts only through a versioned project delta naming the owner, deliverable, evidence gate, affected Spaces, privacy boundary, dependencies, and permission for any external action. No pause destroys prior work.
