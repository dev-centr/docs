# Dark mode analysis (dev-centr docs)

## Current setup

This site uses the [valentus-theme](https://github.com/antora-supplemental/valentus-theme) pre-built UI bundle (`ui-bundle.zip`). Dark mode, Lunr search chrome, and the doc layout ship in the bundle. The playbook adds a `supplemental-ui` layer for the custom domain, DevCentr teal brand CSS, and logo assets.

Migrated from the retired `antora-dark-theme` package (2026-06).

## Branding without forking partials

As of valentus-theme 2.x, header logo and navbar branding use playbook `site.keys` (for example `header_logo`) plus optional SVGs in `supplemental-ui/img/`. Search lives in the tool band (not the header). Consumers should not override `partials/header-content.hbs` for logo wiring alone; keep `head-meta.hbs` in sync with upstream when upgrading.

Color theming uses `supplemental-ui/css/devcentr-brand.css` (accent-token overrides), loaded from a thin `head-meta.hbs` fork (vendored from valentus so FOUC paint-hold, dark-mode, read-width, and font-size boot stay intact). The interim `adt-fouc-pending` class hides the page until layered CSS, preference attrs, and web fonts apply; keep brand CSS in the stylesheet stack before the `document.fonts.ready` release script. Playbook `site.keys` stay snake_case; Antora camelCases them for the UI model.

See `docs/modules/ROOT/pages/publishing/antora-ui-branding.adoc`.
