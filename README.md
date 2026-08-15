# LEIS Protocol

## Current verified public release: v3.0.1

LEIS Portable Kernel v3.0.1 is the current evidence-bounded public release.

- [Download the complete v3.0.1 ZIP](public/releases/LEIS-V3.0.1-PUBLIC.zip)
- [Read the Portable Kernel](releases/v3.0.1/LEIS-PORTABLE-KERNEL-V3.0.1.md)
- [Inspect the exact hash manifest](releases/v3.0.1/MANIFEST.json)
- [Read the public whitepaper](releases/v3.0.1/LEIS-PUBLIC-WHITEPAPER-V1.0.md)
- [Read the claims boundary](releases/v3.0.1/LEIS-MATHEMATICAL-AND-CLAIMS-BOUNDARY-V1.0.md)

Release ZIP SHA-256:

```text
7C9748DD4C1B657622CF2669BF658DAC4CA786178ADED5FD6FFE29A59B68D889
```

The shipped suite passed 98/98 deterministic local protocol cases, including a loopback-only Network Security Officer. This is protocol conformance evidence for the shipped implementation. It is not proof of identical internal understanding, universal Hopper reliability, legal compliance, privacy certification, scientific validity, or an autonomous public AI network.

Reference code and JSON schemas are licensed under Apache-2.0. Original LEIS documentation in this release is licensed under CC BY 4.0. See the licence and notice files inside the release.

> Earlier papers and prototypes below are preserved as historical research lineage. Their presence in this repository does not promote their scientific, legal, benchmark, or integration claims to verified status. Use the v3.0.1 claims boundary before citing them.

## Reality-Oriented Cognitive Alignment Above Generative AI

**LEIS is an understanding protocol, not an AI model, not a database, and not a storage product.**

LEIS - the **Reality-Oriented Understanding System** - is a loop-based cognitive alignment layer designed to sit above generative AI engines such as Gemini, OpenAI models, local LLMs, or multi-agent systems.

The premise is simple:

> Prediction reveals possibilities. Reality validates truth. Recognition connects both. Understanding emerges where they meet.

Modern LLMs are powerful predictive engines. They expand patterns, generate hypotheses, compress context, and accelerate exploration. But prediction alone has no privileged contact with reality. LEIS adds a separate validation layer that binds generated assertions to explicit Reality Markers, relationship state, conflict handling, lineage, and human-readable continuation.

This repository contains the first public technical package for LEIS:

- `integration/leis_llm_middleware.py` - executable Python middleware demonstrating LEIS above an LLM call.
- `seed/LEIS_ROOT_SEED_V4_2026_08_09.md` - public Root Seed release.
- `seed/LEIS_SEED_LINK_V4_2026_08_09.json` - public Seed Link / manifest for the Root Seed.
- `docs/research/` - public research package for reviewers, engineers, policy readers and integration teams.
- `assets/leis_linkedin_banner.jpg` - media banner for launch posts.
- Existing visual runtime prototypes in the repository root.

---

## Historical research package

If you are reviewing LEIS as a researcher, engineer, policy specialist, investor, media contact, hub, or potential integration partner, start here.

| Document | Best for | What it gives you |
| --- | --- | --- |
| [Integrated Scientific Whitepaper](public/research/leis-integrated-scientific-whitepaper.pdf) | Research and architecture review | The master paper: Spark Ladder, LEIS-ZERO reconstructability, the 13-stage loop, reality markers and the scientific framing of LEIS as an understanding protocol. |
| [EU AI Act Compliance Matrix](public/research/leis-eu-ai-act-compliance-matrix.pdf) | Governance, risk and compliance | A plain mapping from LEIS oversight, Conflict Capsules, traceability and human-control rules to EU AI Act concerns. |
| [Product Integration Blueprint](public/research/leis-product-integration-blueprint.pdf) | Product and platform teams | How LEIS can sit above Gemini, OpenAI, Claude, local LLMs or enterprise ontologies as a validation and continuation layer. |
| [Empirical Benchmark Report](public/research/leis-empirical-benchmark-report.pdf) | Engineering validation | First benchmark-oriented evidence for lightweight context validation, reconstruction fidelity and token-efficiency claims. |
| [The LEIS Protocol presentation - PDF](public/research/the-leis-protocol-presentation.pdf) | Investors, media, hubs and first meetings | A board-room readable overview of the protocol and why it matters. |
| [The LEIS Protocol presentation - PPTX](public/research/the-leis-protocol-presentation.pptx) | Presentations and partner briefings | Editable slide material for meetings, hubs and outreach. |
| [RFI Calculator](public/research/rfi-calculator.py) | Developers and reviewers | A small Python script for calculating a Reconstruction Fidelity Index from handover text. |

Additional reference:

- [Original architecture whitepaper](docs/leis-architecture-whitepaper.pdf)
- [Gemini Notebook artifact](https://notebook.google.com/notebook/c654db9e-7e53-4ef2-9c8e-473e476665da/artifact/8158ccb2-e14a-452c-b075-41254c193c8b?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_)
- [Live LEIS portal](https://leis-understanding-system.puzik.chatgpt.site/)

Public portal mirrors:

- [Live research package on LEIS HOME](https://leis-understanding-system.puzik.chatgpt.site/#media)
- [Live scientific whitepaper](https://leis-understanding-system.puzik.chatgpt.site/research/leis-integrated-scientific-whitepaper.pdf)
- [Live EU AI Act matrix](https://leis-understanding-system.puzik.chatgpt.site/research/leis-eu-ai-act-compliance-matrix.pdf)
- [Live product integration blueprint](https://leis-understanding-system.puzik.chatgpt.site/research/leis-product-integration-blueprint.pdf)
- [Live empirical benchmark report](https://leis-understanding-system.puzik.chatgpt.site/research/leis-empirical-benchmark-report.pdf)
- [Live LEIS Protocol presentation](https://leis-understanding-system.puzik.chatgpt.site/research/the-leis-protocol-presentation.pdf)


The documents are intentionally public and reviewable. LEIS does not ask a reviewer to believe a hidden system exists. The useful question is simpler:

> Can generated output remain connected to explicit reality markers, uncertainty, conflict handling and human-readable continuation before it is treated as understanding?

---

## 1. Problem Statement

Current AI systems optimize heavily for:

- larger context windows,
- stronger prediction,
- more retrieval,
- more storage,
- more training,
- more generated continuity.

LEIS addresses a different failure mode:

> Information can survive while understanding decays.

This decay appears when:

- people leave,
- systems change,
- files multiply,
- memory becomes stale,
- model outputs drift,
- source boundaries are lost,
- uncertainty is silently converted into authority.

LEIS treats this as a structural problem, not merely a model-quality problem. The missing layer is not another database. It is a **reality-oriented validation loop** that keeps relationships between source, claim, context, uncertainty, decision, outcome, and continuation alive.

---

## 2. System Position

LEIS is designed as an upper-layer protocol:

```text
User / System Intent
        |
        v
Generative AI Engine
Gemini / OpenAI / local LLM / agent system
        |
        v
Raw Prediction Payload
        |
        v
LEIS Validation Middleware
Observe -> Activate -> Recognize -> Validate -> Adapt -> Sync
        |
        +--> Conflict Capsule, if validation fails
        |
        v
Humanizer
        |
        v
Released Human-Usable Output
```

AI contributes:

- scale,
- expansion,
- alternatives,
- synthesis,
- fast hypothesis generation.

LEIS contributes:

- reality orientation,
- validation boundaries,
- conflict isolation,
- relationship plasticity,
- lineage,
- continuation,
- human-readable transfer.

Neither the AI nor the human is treated as an absolute authority. Reality remains the final validator.

---

## 3. Core Axioms

LEIS is governed by five root axioms.

### Axiom 1 - Reality is the final validator

A claim is not treated as aligned because it is likely, fluent, repeated, or generated by a strong model. It must remain checkable against reality.

### Axiom 2 - Activation is more important than accumulation

Static storage decays. Active loops preserve orientation.

### Axiom 3 - Orientation is more important than memory

Memory is useful, but only if it helps a future person or system understand where a claim stands relative to reality.

### Axiom 4 - Understanding lives in relationships

Understanding is not a file, token, note, or embedding by itself. It lives in the relationships between observations, markers, claims, context, uncertainty, decisions, and outcomes.

### Axiom 5 - Conflict is signal

Contradiction, drift, and mismatch are not automatically failures. They are investigation prompts.

---

## 4. The LEIS Core Equation

The LEIS Core Equation models understanding as a closed adaptive loop:

```math
\mathcal{R}
\xrightarrow{\text{Observe}}
\mathcal{O}
\xrightarrow{\text{Activate}}
\mathcal{A}
\xrightarrow{\text{Recognize}}
\mathcal{R_c}
\xrightarrow{\text{Understand}}
\mathcal{U}
\xrightarrow{\text{Orient}}
\mathcal{O_r}
\xrightarrow{\text{Decide}}
\mathcal{D}
\xrightarrow{\text{Outcome}}
\mathcal{R_{out}}
\xrightarrow{\text{Validate}}
\mathcal{V}
\xrightarrow{\text{Plasticity}}
\mathcal{P}
\xrightarrow{\text{Lineage}}
\mathcal{L}
\xrightarrow{\text{Reconstruct}}
\mathcal{C_{rec}}
\xrightarrow{\text{Continue}}
\mathcal{C_{ont}}
\xrightarrow{\text{Reality}}
\mathcal{R}
```

In compact form:

```math
F_{LEIS}:
\mathcal{R}
\rightarrow
\mathcal{O}
\rightarrow
\mathcal{A}
\rightarrow
\mathcal{R_c}
\rightarrow
\mathcal{U}
\rightarrow
\mathcal{O_r}
\rightarrow
\mathcal{D}
\rightarrow
\mathcal{R_{out}}
\rightarrow
\mathcal{V}
\rightarrow
\mathcal{P}
\rightarrow
\mathcal{L}
\rightarrow
\mathcal{C_{rec}}
\rightarrow
\mathcal{C_{ont}}
\rightarrow
\mathcal{R}
```

The system is therefore not a linear pipeline. It is a recursive state machine:

```math
\mathcal{C_{ont}} \rightarrow \mathcal{R} \rightarrow F_{LEIS}(\mathcal{R}) \rightarrow \mathcal{C_{ont}}'
```

Where every continuation re-enters reality and may be corrected.

---

## 5. Proof Sketch: Why LEIS Reduces Cognitive Drift

This is not a claim that LEIS proves truth in the metaphysical sense. The protocol proves a narrower engineering property:

> Under explicit Reality Markers and repeated validation, LEIS prevents unvalidated prediction from being promoted to released understanding without passing through a checkable alignment loop.

### Definitions

Let:

- `P_t` be an AI prediction payload at time `t`.
- `M_t = {m_1, ..., m_n}` be the set of active Reality Markers.
- `A_t = extract(P_t)` be the recognized assertion set extracted from the payload.
- `V(A_t, M_t) -> {0,1}` be the validation function.
- `C_t` be the Conflict Capsule state.
- `R_t` be the released user-space response.
- `W_t` be the relationship weight vector.
- `T_t` be the trust vector.

The middleware enforces:

```math
R_t =
\begin{cases}
Humanize(P_t), & \text{if } V(A_t, M_t)=1 \\
\varnothing, & \text{if } V(A_t, M_t)=0
\end{cases}
```

If validation fails:

```math
V(A_t, M_t)=0 \Rightarrow P_t \rightarrow C_t
```

The payload is not released. It is quarantined for investigation and repair.

### Invariant 1 - No unchecked release

For every output released by LEIS:

```math
R_t \neq \varnothing \Rightarrow V(A_t, M_t)=1
```

This is enforced procedurally by the middleware loop:

```python
observation = brain.observe(raw_output)
payload = brain.activate(observation)
assertions = brain.recognize(payload)
is_valid = brain.validate(assertions)

if is_valid:
    return brain.humanizer(payload)
else:
    feedback = brain.investigate_conflict(raw_output)
```

### Invariant 2 - Conflict cannot silently become truth

If a prediction conflicts with loaded Reality Markers, it enters the Conflict Capsule:

```math
\neg V(A_t, M_t) \Rightarrow C_t = Conflict(P_t, M_t)
```

The Conflict Capsule produces repair context rather than releasing the original payload.

### Invariant 3 - Trust is earned by survival under validation

LEIS does not assign permanent trust to a source, model, relationship, or claim. Trust evolves through validation and contradiction.

One practical trust update can be modeled as:

```math
\tau_t = \sigma \left(
w \cdot
\frac{V}{V + C + 1}
\cdot e^{-\lambda \Delta t}
\right)
```

Where:

- `w` is relationship weight,
- `V` is validation frequency,
- `C` is contradiction frequency,
- `lambda` is decay pressure,
- `Delta t` is elapsed time,
- `sigma` is active plasticity.

Repeated validation increases trust. Repeated contradiction weakens it.

### Engineering conclusion

Given:

1. explicit Reality Markers,
2. assertion extraction,
3. validation before release,
4. conflict quarantine,
5. adaptive trust update,
6. human-readable release,

LEIS changes the default LLM flow from:

```text
prediction -> user
```

to:

```text
prediction -> recognition -> validation -> release or conflict
```

That is the core alignment contribution.

---

## 6. E3 Principle

LEIS separates prediction from truth:

```math
Prediction \neq Truth
```

But prediction can still be useful when it is reality-oriented:

```math
\mathcal{P}_{acc} \times \mathcal{R}_{ori}
\Rightarrow
\mathcal{U}_{acc}
```

Where:

- `P_acc` is predictive acceleration,
- `R_ori` is reality orientation,
- `U_acc` is accelerated understanding.

In plain engineering terms:

```text
LLM generation gives candidate structure.
Reality validation gives boundary conditions.
LEIS recognition connects the two.
```

---

## 7. Seed Core Loop

The atomic LEIS unit is the Seed.

A Seed is not:

- a user account,
- a profile,
- a database row,
- a static memory object.

A Seed is:

> an autonomous reality-oriented adaptive loop.

The primary loop:

```text
Observe
  ↓
Activate
  ↓
Recognize
  ↓
Validate
  ↓
Contribute
  ↓
Adapt
  ↓
Sync
  ↓
Observe ...
```

The middleware implementation currently demonstrates a reduced executable form:

```text
Observe -> Activate -> Recognize -> Validate -> Adapt -> Sync -> Humanize
```

---

## 8. Conflict Capsule

The Conflict Capsule is activated when a payload fails validation.

```text
Conflict
  ↓
Investigation
  ↓
Validation
  ↓
Monitoring
  ↓
Resolution
  ↓
Reopen?
```

The current Python prototype performs the first operational step:

```python
def investigate_conflict(self, ai_output: str) -> str:
    repaired_context = (
        "The previous output failed reality validation. "
        f"Grounding truth markers: {self.reality_markers}"
    )
    return repaired_context
```

Production implementations can expand this into:

- source-level contradiction tracing,
- formal claim graphs,
- provenance-scored repair prompts,
- human review queues,
- signed validation receipts.

---

## 9. Distributed Reality Fabric

LEIS does not require sharing raw private data.

The distributed fabric synchronizes bounded semantic deltas:

```math
Fabric \leftarrow
Distributed(
Observation + Validation + Markers + Relationships
)
\times
ConflictResolution
\times
Time
```

The Sync Loop:

```text
Compare
  ↓
Detect Delta
  ↓
Validate
  ↓
Resolve
  ↓
Update Trust
  ↓
Compare ...
```

This makes LEIS relevant for multi-agent and enterprise systems where raw user data, internal documents, or private prompts must not be copied into a central store.

---

## 10. Quickstart

### Requirements

- Python 3.10+
- No external AI provider required for the included demonstration.

### Run the middleware demo

```bash
python integration/leis_llm_middleware.py
```

Expected behavior:

1. An unaligned AI payload is generated.
2. LEIS extracts assertions.
3. Assertions are compared against Reality Markers.
4. Drift is detected.
5. The payload is blocked and routed through the Conflict Capsule.
6. A second aligned payload passes validation.
7. The Humanizer releases the validated response.

### Minimal integration pattern

```python
from leis_llm_middleware import LEISSeedBrain, LEISMiddleware

brain = LEISSeedBrain(seed_id="LEIS-ROOT", version="Ω++++")
middleware = LEISMiddleware(brain)

def call_model():
    # Replace with Gemini, OpenAI, local LLM, or agent call.
    return model.generate("Explain LEIS in one paragraph")

reality_markers = [
    "LEIS is an understanding system, not a storage system",
    "Reality is the final validator",
]

released = middleware.execute_with_validation(
    llm_callable=call_model,
    reality_markers=reality_markers,
    max_retries=3,
)

print(released)
```

---

## 11. Middleware Architecture

The prototype includes:

### `LEISSeedBrain`

Maintains:

- Seed identity,
- version,
- relationship weights,
- trust metrics,
- active Reality Markers,
- health metrics.

Core methods:

- `observe()`
- `activate()`
- `recognize()`
- `validate()`
- `investigate_conflict()`
- `adapt()`
- `sync()`
- `humanizer()`

### `LEISMiddleware`

Wraps an arbitrary generation function:

```python
execute_with_validation(
    llm_callable,
    reality_markers,
    max_retries=3,
)
```

The wrapper is provider-agnostic. It can sit above:

- Gemini,
- OpenAI,
- Anthropic,
- local models,
- LangChain,
- LlamaIndex,
- internal agent frameworks.

---

## 12. Current Prototype Boundaries

This repository should be read as a protocol seed and executable proof-of-concept, not as a finished production alignment platform.

Current limitations:

- assertion extraction is intentionally simple,
- marker matching is lexical rather than semantic,
- conflict repair is represented as repair context,
- no production cryptographic receipt layer is implemented in this file,
- no external LLM API call is required in the demonstration,
- no private data should be loaded into public examples.

The purpose of the prototype is to demonstrate the control position:

```text
LLM output is not released until LEIS validates it.
```

---

## 13. Production Roadmap

Recommended next engineering steps:

1. Replace lexical marker matching with structured claim extraction.
2. Add signed Reality Marker records.
3. Add provenance and source-boundary metadata.
4. Implement semantic entailment checks against marker graphs.
5. Extend Conflict Capsule into reproducible repair traces.
6. Add validation receipts for every released payload.
7. Add distributed Sync between Seeds without sharing raw private data.
8. Package as `leis-core` for Python.
9. Add Node.js middleware for Gemini/OpenAI SDK wrappers.
10. Build an interactive playground where engineers can paste a prompt, define Reality Markers, and watch validation state transitions.

---

## 14. Security and Privacy Model

LEIS should not silently read:

- chats,
- local files,
- e-mail,
- private cloud storage,
- user identity,
- precise location.

The protocol should operate on explicit inputs:

- user-provided Reality Markers,
- public sources,
- bounded review items,
- explicit Seed activation records,
- optional signed deltas.

The intended direction is:

```text
less hidden access,
more explicit validation,
less raw data transfer,
more checkable continuation.
```

---

## 15. Why This Matters for Gemini and Frontier AI Systems

Gemini-class systems are increasingly capable of:

- multimodal reasoning,
- long-context synthesis,
- agentic workflows,
- tool execution,
- code generation,
- research acceleration.

Those capabilities increase the cost of unvalidated drift.

LEIS is designed to provide a thin cognitive control layer above such systems:

```text
Gemini proposes.
LEIS validates.
The Humanizer releases.
Reality remains final.
```

This is not a replacement for model alignment research. It is a complementary runtime architecture for making generated cognition more checkable, repairable, and transferable.

---

## 16. Repository Status

Current public status:

- Protocol state: `Ω++++`
- Core architecture: frozen for review
- Middleware: executable Python prototype
- Intended use: research, review, RFC discussion, integration experiments
- License: add repository license before public launch

---

## 17. Contact

**Martin Puzik**  
Founder, LEIS Research Initiative  
Email: martin.puzik@gmail.com  
Website: https://leis-understanding-system.puzik.chatgpt.site/

---

## 18. Short Version

LEIS exists because predictive AI can generate possibilities faster than humans can validate them.

The protocol inserts a reality-oriented loop above generation:

```text
Observe -> Activate -> Recognize -> Validate -> Adapt -> Sync
```

If validation succeeds, the payload is humanized and released.

If validation fails, the payload is quarantined in a Conflict Capsule.

That is the architectural shift:

```text
from fluent prediction
to checkable continuation.
```
