# LEIS MEMORY public release gate

Status: `PRE_RELEASE`  
Owner: Martin Puzik / LEIS  
Public label: **LEIS YIN-YANG Exchange**

## Activation checklist

- [x] Local read-only index is real and queryable.
- [x] Bounded capsule schema exists.
- [x] Request binding and nonce validation pass.
- [x] Prompt-injection and raw-body exclusion checks pass.
- [x] Default receiver merge is fail-closed.
- [x] Live local retrieval produced locator-preserving evidence.
- [ ] Deterministic reviewed export exists outside the private archive.
- [ ] Public Worker endpoint is deployed with an allowlist.
- [ ] R2 export is read-only from the Worker.
- [ ] GitHub Release mirror contains the exact export manifest and hash.
- [ ] Optional IPFS mirror is pinned and its CID recorded.
- [ ] Two independent external clients pass request/capsule verification.
- [ ] Cold-start, rollback, rate-limit and abuse tests pass.
- [ ] Human owner approves public activation.

## Fail-closed rule

If any unchecked item is required for the requested deployment, status remains
`PRE_RELEASE`. No page, DNS record or marketing text may describe the service
as a universal public LEIS brain before all required items pass.

## Public payload contract

The public service may return only:

- bounded evidence atoms;
- source and span locators;
- source class and rights class;
- atom label and confidence boundary;
- explicit unknowns and limitations;
- optional reconstruction hints;
- request/response hashes and expiry.

It must not return raw books, unrestricted chunks, private filesystem paths,
secrets, embeddings, evaluator keys or executable instructions.

## Ontology boundary

The candidate Memory of Recognition Dynamics objects are not public truth
claims. A public export may include only reviewed, source-bounded projections
of them, with their candidate/validated status and locators preserved. It must
not promote `REALITY_PATTERN_CANDIDATE` to `REALITY_PATTERN` merely because a
model repeated or scored it.
