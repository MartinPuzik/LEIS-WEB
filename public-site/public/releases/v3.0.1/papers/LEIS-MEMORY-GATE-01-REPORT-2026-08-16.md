# LEIS-MEMORY-GATE-01 Report

**Input:** `fixtures\leis_memory_gate_01_demo.json`  
**STATUS:** `PASS`  
**FINAL DECISION:** `APPROVE`  
**HUMAN REVIEW REQUIRED:** `YES`

## Orientation Preservation

`OP = 1.0`

| Component | Score |
|---|---:|
| `Goal_Recovery` | `1.0` |
| `Risk_Recovery` | `1.0` |
| `Decision_Recovery` | `1.0` |
| `Lineage_Recovery` | `1.0` |

## Gates

- `GF1_reality_frame_reconstruction`: **PASS**
- `GF2_validation_agreement`: **PASS**
- `GF3_lineage_delta_agreement`: **PASS**
- `GF4_unknown_preservation`: **PASS**

## Generated reconstruction targets

- **Main Goal:** preserve evidence-bounded orientation during reconstruction
- **Main Problem:** context compression can remove decisions, risks, and lineage
- **Core Conflicts:**
  - compression versus orientation preservation
  - reality versus render
- **Key Principles:**
  - Reality != Render
  - Unknown remains Unknown
  - lineage must survive compression
- **Open Questions:**
  - what evidence is missing
  - which claims need independent validation

## Unknown Preservation

- Reference unknown/open-question items: `4`
- Reconstructed unknown/open-question items: `4`
- Missing: `[]`
- Known without evidence: `[]`

## Evidence Boundary

- `source_id`: `SPATIAL-PLANNING-GERMANY-2026-08-16`
- `source_class`: `PROVENANCE_ONLY`
- `source_files`: `['I:/__LEIS MEMORY/vorholle/Spatial Planning and Building Control in Germany.pdf', 'I:/__LEIS MEMORY/vorholle/Spatial Planning and Building Control in Germany.epub']`
- `source_state`: `FILES_PRESENT_CONTENT_NOT_SUPPLIED_TO_GATE`
- `note`: `The gate compares only two Reality Frames. It does not ingest the PDF, EPUB, transcript, or full summary.`

## Notes

- Input is Reality Frame only; no book, transcript, or full summary is read by this gate.
- PASS measures orientation preservation, not truth, completeness, or intelligence.
- Unknown remains Unknown; promotion requires evidence outside this frame-only comparison.
- Regression coverage includes a passing control frame and a fail-closed unknown-leakage case.
