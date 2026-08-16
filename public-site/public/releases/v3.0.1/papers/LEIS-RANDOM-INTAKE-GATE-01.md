# LEIS Random Intake Gate 01

Status: `ACTIVE` (2026-08-16)

## Purpose

Test whether LEIS-MEMORY-GATE-01 preserves orientation across unrelated,
randomly selected domains rather than only across a curated LEIS-friendly set.

## Protocol

1. Place only PDFs and EPUBs in the declared intake folder. This run uses
   `I:\__LEIS MEMORY\vorholle` (109 files).
2. Refresh the append-only catalogue; do not move or rename existing sources.
3. Draw a reproducible random sample with a recorded seed. No semantic
   filtering is applied before selection.
4. Extract locally with locator-preserving chunks. Existing successful hashes
   are skipped; changed files receive a new extraction record.
5. Generate a Reality Frame from each selected source.
6. Run independent reconstruction and score GF-1 through GF-4 plus OP.
7. Preserve disagreements and UNKNOWN values; do not promote one run to a
   universal claim.

## Gate outputs

- candidate manifest with seed and source IDs;
- extraction/checkpoint report;
- blinded reconstruction fixtures;
- two-rater evaluation sheet;
- PASS / HOLD / FAIL report with explicit scope.

## Current run

The reproducible sample is recorded in
`outputs/LEIS-RANDOM-INTAKE-GATE-01-vorholle.selection.json` with seed
`20260816`, sample size `20`, and candidate count `109`. Metadata preparation
completed for all 109 sources; the long-running reader is processing them in
the background. At the last checkpoint, 9 of 109 had reached
`CONTENT_EXTRACTED`; the remaining files are queued or in progress. This is
an active intake, not a semantic validation result.

## Boundaries

The public Memory dashboard exposes progress metadata only. Source files and
full text remain local. `FULLY_READ` means successful local extraction with
locator-preserving chunks and at least 1,000 characters; it does not mean
semantic or factual validation.
