# LEIS-MEMORY-GATE-01 — Orientation Preservation

Status: local executable candidate; frame-only control fixture included.

## Purpose

Measure whether orientation survives context compression. The gate does not decide whether a book, document, or model output is true. It checks whether a retained `Reality Frame` and an independent reconstructed frame preserve the same operational orientation.

## Input boundary

The gate accepts exactly two semantic objects:

- `reference_frame`: retained U0-like frame;
- `reconstructed_frame`: independently produced frame.

The PDF, EPUB, full book, transcript, and full summary are not gate inputs. Source paths may appear only in `source` as provenance metadata. `Reality != Render` remains mandatory.

## Required frame fields

`main_goal`, `main_problem`, `core_conflicts`, `key_principles`, `open_questions`, `unknowns`, `decisions`, and `lineage`. The frame also carries `validation_conclusion` and `lineage_delta` for GF2/GF3.

## Orientation Preservation (OP)

The gate calculates four recoveries:

```text
OP = (Goal Recovery + Risk Recovery + Decision Recovery + Lineage Recovery) / 4
```

The default pass threshold is `0.80` for OP and for every component. Goal recovery uses normalized token overlap; risks, decisions, and lineage use normalized set overlap. This is an auditable baseline, not a claim of semantic completeness.

## Gates

- **GF1 — Reality Frame Reconstruction:** OP and all four components meet threshold.
- **GF2 — Validation Agreement:** reference and reconstructed `validation_conclusion` agree.
- **GF3 — Lineage Delta Agreement:** both frames report the same non-empty important delta.
- **GF4 — Unknown Preservation:** no reference unknown/open-question item is missing and no such item is promoted into a reconstructed known field without evidence.

## Decisions

| Status | Final decision | Meaning |
|---|---|---|
| `PASS` | `APPROVE` | all four gates pass and OP >= 0.80 |
| `HOLD` | `HOLD` | insufficient agreement; no unknown leakage detected |
| `FAIL` | `REJECT` | malformed input, unresolved placeholders, or unknown leakage |

Human review remains required even after `PASS`. A pass is orientation preservation, not truth, legal compliance, completeness, or intelligence certification.

## Run

```text
python tools/leis_memory_gate_01.py fixtures/leis_memory_gate_01_demo.json --report outputs/LEIS-MEMORY-GATE-01-REPORT-2026-08-16.md
```

The supplied demo is a synthetic control fixture proving the validator mechanics. A real empirical gate requires a retained frame and an independently reconstructed frame produced without the retained frame's hidden details.

Regression check:

```text
python tools/test_leis_memory_gate_01.py
```

This checks both a passing control frame and a fail-closed unknown-leakage case.
