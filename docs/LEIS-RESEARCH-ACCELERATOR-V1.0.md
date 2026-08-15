# LEIS Research Accelerator v1.0

Status: practical operating design
Date: 2026-08-15

## Decision

LEIS will not search for billing, rate-limit, safety, or access-control loopholes. There is no defensible promise of a 1000x universal speed-up. The usable route is to remove model work that software can do deterministically, compress the remaining work into bounded Capsules, and reserve expensive reasoning for decisions where it changes the outcome.

## Three-lane runtime

### Lane 0 - deterministic and local

Use ordinary local code for hashing, schema validation, duplicate detection, extraction, exact source coordinates, manifests, diffs, test execution, and release gates. This costs no model tokens and is the default lane.

### Lane 1 - economical reconstruction

Use a small or local model for classification, candidate evidence atoms, translation drafts, question clustering, and first-pass reconstruction. Outputs remain `REPORTED` or `HYPOTHESIS` until checked.

OpenAI publishes open-weight gpt-oss models that can run on infrastructure controlled by the user. The weights are available under Apache 2.0, but the user still bears hardware, electricity, storage, and maintenance costs. This is an optional research path, not an implemented LEIS fallback. Source: [OpenAI open models](https://openai.com/open-models/) and [OpenAI help: gpt-oss](https://help.openai.com/en/articles/11870455-openai-open-weight-models-gpt-oss).

### Lane 2 - frontier review

Use the strongest available model only for adversarial review, cross-domain synthesis, ambiguity resolution, final human-facing writing, and decisions whose error cost justifies it. Send the smallest evidence-complete Capsule, not an archive dump.

## API efficiency when an API is appropriate

- Keep stable instructions, tools, schemas, and examples at the beginning and variable task data at the end. OpenAI prompt caching works automatically for eligible requests and exact prefix matches; stable prefixes can reduce latency and cost. Source: [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching).
- Put non-urgent evaluations and source classification into batches. OpenAI documents a 50% cost discount, a separate rate-limit pool, and completion within 24 hours for Batch API jobs. Source: [OpenAI Batch API](https://developers.openai.com/api/docs/guides/batch).
- Use Flex processing only for delay-tolerant, lower-priority work. OpenAI documents lower cost in exchange for slower responses and occasional resource unavailability. Source: [OpenAI Flex processing](https://developers.openai.com/api/docs/guides/flex-processing).
- Set explicit token, request, and daily spending ceilings. Stop automatically when a ceiling is reached; never retry without bounds.

These API options are separate from a ChatGPT subscription and do not create free ChatGPT usage.

## LEIS cycle compression

```text
SOURCE COORDINATES
  -> deterministic extraction/deduplication
  -> labelled evidence atoms
  -> one bounded research batch
  -> one frontier synthesis
  -> adversarial RECEIPT
  -> human decision
  -> append-only DELTA
```

Rules:

1. Ask one decision question per Capsule.
2. Reuse IDs instead of repeating source text.
3. Retrieve only cited fragments needed for the task.
4. Compare structured outputs before asking a model to explain prose.
5. Cache accepted evidence atoms locally; never re-research them unless their validity date expires.
6. Run two independent reconstructions only at release gates, not every cycle.
7. Escalate to a stronger model only when a recorded uncertainty or conflict remains.

## Measurement

Track per task:

```text
wall_time
human_minutes
model_requests
input_tokens
output_tokens
estimated_cost
cache_hit_tokens
evidence_atoms_reused
critical_gate_failures
final_human_acceptance
```

The target is not maximum output. It is lower cost and elapsed time per accepted, evidence-backed decision. Any speed claim requires a baseline, repeated runs, and the same acceptance standard.

## Immediate operating profile

- Local tests and file processing: Lane 0.
- Bulk book/source triage: Lane 0, then Batch or a local model if approved and available.
- Golden Question clustering: Lane 1.
- Kernel, legal, scientific, and public-release decisions: Lane 2 plus primary sources and human approval.
- No hidden cross-chat access, no credential reuse, no autonomous paid queue, and no claim that this document activates a local model.

