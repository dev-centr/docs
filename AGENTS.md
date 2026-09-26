# Agent notes — docs

Org-wide modules live in [`dev-centr/agent-rules`](https://github.com/dev-centr/agent-rules) (`AGENTS.md`, `agents/`).

- Editorial titles → `agents/editorial/titles.md`
- Docs encoding / SVG mojibake → skill `fix-docs-encoding` in agent-rules (transcode repair, not refactor). Hub Pages only rebuilds when **this** repo deploys — after fixing images in a component (e.g. `general-knowledge`), push a hub change (or re-run Deploy) so `_images/` updates.
- Diagrams: Kroki bake for PlantUML (+ Themed SVG pipeline live/unmaintained); **client Mermaid** via `@antora-supplemental/mermaid-client` (CDN default). Lightbox (zoom/pan): `@antora-supplemental/diagram-lightbox`. See `publishing/antora-diagram-formats.adoc`. Compose pack: `antora-supplemental/facto-stack` — do not force extras into Valentus `v2`.
- **Internet Architecture** is a peer home-nav group (body in `general-knowledge`); not under product SPE Architecture.

Add **repo-only** facts below.
