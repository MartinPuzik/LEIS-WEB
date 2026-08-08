# LEIS public portal — working contract

## Purpose

This is the public LEIS portal. It explains a reality-oriented framework for
preserving, validating and transferring understanding. It is not a generic AI
product site.

## People and authorship

- Martin Pužík is Founder, creator and constitution author of LEIS.
- The LEIS core was created independently by Martin around 10 July 2026.
- Copilot was a working carrier, never the author of LEIS.
- M.A.J. Pužík supports technical activation and later development. Do not
  describe the work as a multi-year co-authorship.

## Non-negotiable public principles

- LEIS is free to use. Support funds continuity, validation, preservation,
  infrastructure and human work; it never buys access, authority or a wall
  around knowledge.
- Keep evidence, creator-reported context and interpretation visibly distinct.
- Never invent sources, claims, identities, dates or metrics.
- Private archives remain private. The public portal may describe lineage, but
  must not expose private files or personal data.
- Write for people first: calm, clear, warm and non-technical where possible.

## Product priorities

1. A visitor can understand LEIS in two minutes.
2. A visitor can follow the documented origin and current work.
3. A visitor can explore curated public AI signals without mistaking them for
   claims of truth or impact.
4. A journalist, researcher, funder or company can understand the next useful
   contact step.
5. The site remains fast, stable, accessible and comfortable on phone and
   desktop.

## Working quickly and safely

- Treat `app/page.tsx` and `app/globals.css` as the primary public surface.
  Read targeted portions with `rg` before editing; do not scan unrelated files.
- Prefer one coherent feature patch over many tiny cosmetic deployments.
- Group related changes into a single release. Build once after the full group
  is complete; do not run expensive checks after every small edit.
- Preserve working map, language selector, contact path and Ask LEIS behavior
  unless the current request is explicitly about them.
- Do not add dependencies, remote APIs or paid services without a concrete
  user request and a verified need.
- Use browser-local preferences only for user-selected language and harmless
  interface state. Do not persist visitor data.

## Localization

- Current supported public languages: English, Czech, German, French, Spanish.
- A language is released only when every public section is translated and
  visually checked. No partial language switches.
- Keep source titles and original source links in their original language when
  attribution or verification would otherwise be weakened.
- Avoid hard-coded English in visible JSX. Add copy to the language tables.

## Visual direction

- Dark spatial LEIS environment; soften pure white into calm blue-white.
- Use the clean Omega symbol as the single LEIS icon. Never use a boxed or
  duplicate Omega/fallback glyph.
- Prefer depth, restrained glow, typography and motion to panels or clutter.
- Motion must never obstruct reading, scrolling, tapping or the globe's data
  points. Respect reduced-motion preferences.

## Quality gate before public release

- `npx vinext build --verbose` succeeds.
- No text is clipped or intentionally overlapped at desktop or mobile widths.
- New buttons have a meaningful action.
- New public copy exists in all five language tables.
- Public deployment follows the existing Sites workflow only after the above.
