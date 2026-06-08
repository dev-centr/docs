# Antora Dark Mode Analysis

## Summary

This site uses the [antora-dark-theme](https://github.com/antora-supplemental/antora-dark-theme) pre-built UI bundle (`ui-bundle.zip`). Dark mode, Lunr search chrome, and the doc layout ship in the bundle. The playbook adds a minimal `supplemental-ui` layer (currently `CNAME` for the custom domain only).

## How It Works

The theme bundle includes:

- `partials/head-meta.hbs` — loads `site-extra.css` and pre-applies the `dark-theme` class when a saved preference exists or the OS is in dark mode.
- `partials/footer-scripts.hbs` — loads `site-dark-mode.js` after the default UI scripts.
- `js/site-dark-mode.js` — injects or binds the toggle button and persists the choice in `localStorage` under `antora-theme`.
- `css/site-extra.css` — applies dark colors using explicit selectors under `html.dark-theme`.

## Branding (v1.0.12+)

As of antora-dark-theme v1.0.12, header logo and navbar branding use playbook `site.keys` (for example `header_logo`) plus optional SVGs in `supplemental-ui/img/`. Consumers no longer need to override `partials/header-content.hbs` for logo wiring alone.

See `docs/modules/ROOT/pages/publishing/antora-ui-branding.adoc` in this repo for the full branding guide.

## Files Involved

- `antora-playbook.yml` — UI bundle URL and `supplemental_files`
- `supplemental-ui/ui.yml` — static file publish rules (`CNAME`)
- `supplemental-ui/CNAME` — custom domain for GitHub Pages

## Validation

Run locally:

```bash
pnpm build
```

Then open `build/site/index.html`, click the theme toggle, and confirm `dark-theme` is present on the `<html>` element and styles change.
