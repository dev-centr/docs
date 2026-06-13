# Dark mode analysis (dev-centr docs)

## Current setup

This site uses the [valentus-theme](https://github.com/antora-supplemental/valentus-theme) pre-built UI bundle (`ui-bundle.zip`). Dark mode, Lunr search chrome, and the doc layout ship in the bundle. The playbook adds a minimal `supplemental-ui` layer (currently `CNAME` for the custom domain only).

Migrated from the retired `antora-dark-theme` package (2026-06).

## Branding without forking partials

As of valentus-theme v1.1.0, header logo and navbar branding use playbook `site.keys` (for example `header_logo`) plus optional SVGs in `supplemental-ui/img/`. Consumers no longer need to override `partials/header-content.hbs` for logo wiring alone.

See `docs/modules/ROOT/pages/publishing/antora-ui-branding.adoc`.
