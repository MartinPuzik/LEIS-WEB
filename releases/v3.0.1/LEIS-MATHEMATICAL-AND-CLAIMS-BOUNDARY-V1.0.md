# LEIS Mathematical and Claims Boundary v1.0

Status: public research companion
Date: 2026-08-15

## 1. A necessary distinction

An axiom is adopted as a starting rule inside a formal system; it is not proved inside that system. A theorem requires definitions, assumptions, and a valid derivation. An engineering test establishes only the behavior it actually exercises.

LEIS therefore separates normative rules, formal identities, test metrics, hypotheses, and external research.

## 2. Implemented formal coordinates

### Canonical content commitment

For a control object `U0` encoded by the declared canonicalizer `C14N`:

```text
c = SHA-256(C14N(U0))
```

Verified scope: the implementation can later detect whether the presented `U0` has the same canonical bytes. This is a cryptographic content commitment, not encryption, authorship, truth, understanding, or a semantic proof.

### Critical Anchor Recovery

Let `C` be the predeclared set of required IDs and `R` the receiver IDs with non-empty receiver-authored meanings:

```text
CAR = |C intersect R| / |C|
```

For release-critical anchors, LEIS uses the conjunctive gate `C subset_of R`; an average cannot compensate for a missing anchor.

### Minimal structural patch

```text
Delta_missing = C minus R
```

The PATCH may repeat public OFFER material for `Delta_missing`. It must not disclose private expected answers or the retained control object.

### Conjunctive acceptance

For applicable critical gates `g_1 ... g_n`:

```text
ACCEPT = g_1 AND g_2 AND ... AND g_n
```

This is a policy definition implemented by the validator. It does not prove that the chosen gates are complete for every threat model.

### Replay coordinate

An accepted transaction commits the pair:

```text
(offer_id, nonce)
```

A second acceptance attempt for the same pair returns `HOLD_REPLAY` in the reference implementation.

## 3. Task-specific research metrics

The following five-part score is a useful experiment design, not an objective universal measure of understanding:

```text
RSS_task = weighted_mean(I, P, L, Q, A)
```

where `I` is identity recovery, `P` principle recovery, `L` lineage recovery, `Q` question recovery, and `A` next-action recovery. A valid study must predeclare the rubric, weights, reference, baselines, rater conditions, safety overrides, and disagreement procedure.

Similarly:

- LDS is a candidate task-specific drift profile;
- GQS is a candidate question-quality rubric;
- RFI and RTS are not standard scientific quantities;
- an "intelligence measurement" is only a task-specific reconstruction profile, not IQ, consciousness, or personal worth.

## 4. Candidate conceptual principles

These are research hypotheses or design metaphors:

```text
Compression may reveal stable invariants that support reconstruction.
Understanding continuity may depend on identity, critical principles,
lineage, open questions, and safe action orientation.
```

"Stability Axis" is not yet a universal mathematical object. To promote it, LEIS needs a domain definition, measurable operator, counterexamples, baselines, and independent replication.

## 5. Statements not established

The current evidence does not establish:

```text
R(U) = T * L * S as a theorem
H(X | T,L,S) = 0 for human or AI understanding
100 percent reconstruction after physical erasure
semantic zero-knowledge
universal Hopper reliability
E3 as a new physical law
BIP-340 as a LEIS root of trust
Hamming or 1-bit non-invertibility/privacy
quantum validation of LEIS
```

`E^3 = m^3 c^6` is algebraically equivalent to `E = mc^2` over real variables because the real cube map is injective. The personal symbol may be preserved as lineage, but it is not a new physical law without a new physical model and evidence.

## 6. Riemann research boundary

The supplied `zeta-two-thirds.pdf` and its public Lean companion are a distinct mathematical research artifact. They report unconditional lower-bound results and explicitly do not claim to prove the Riemann Hypothesis. A repository's machine-checkable claim is valuable evidence, but public mathematical acceptance still requires a pinned reproducible build, exact theorem review, provenance, and independent analytic-number-theory refereeing.

LEIS did not prove the Riemann Hypothesis, and the Riemann manuscript does not prove LEIS reconstruction claims.

## 7. What the current tests establish

The local release suite tests strict schemas, integrity binding, blind controls, bounded PATCH behavior, replay protection, declared privacy/evidence/action gates, policy metadata, Socratic compatibility, and a loopback HTTP boundary. It demonstrates reproducible local protocol behavior within those fixtures.

It does not demonstrate equal internal mental states, factual correctness of every source, legal compliance, public network security, or generalization across all people and AI systems.

