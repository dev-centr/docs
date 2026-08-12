# Agent notes — docs

Org-wide modules live in [`dev-centr/agent-rules`](https://github.com/dev-centr/agent-rules) (`AGENTS.md`, `agents/`).

- Editorial titles → `agents/editorial/titles.md`
- Docs encoding / SVG mojibake → skill `fix-docs-encoding` in agent-rules (transcode repair, not refactor). Hub Pages only rebuilds when **this** repo deploys — after fixing images in a component (e.g. `general-knowledge`), push a hub change (or re-run Deploy) so `_images/` updates.

Add **repo-only** facts below.
