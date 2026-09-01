'use strict'

/** Known home pages for packages listed in playbook extension stacks. */
const PACKAGE_HOME = {
  '@antora/lunr-extension': 'https://gitlab.com/antora/antora-lunr-extension',
  '@antora-supplemental/site-nav-tree': 'https://github.com/antora-supplemental/site-nav-tree',
  '@antora-supplemental/nav-typology': 'https://github.com/antora-supplemental/nav-typology',
  '@antora-supplemental/nav-typology-diataxis':
    'https://github.com/antora-supplemental/nav-typology-diataxis',
  '@antora-supplemental/page-context': 'https://github.com/antora-supplemental/page-context',
  'asciidoctor-kroki': 'https://github.com/Mogztter/asciidoctor-kroki',
}

const UI_BUNDLE_HOME = {
  'valentus-theme': 'https://github.com/antora-supplemental/valentus-theme',
  'architexture-theme': 'https://github.com/antora-supplemental/architexture-theme',
}

function normalizeExtensionId (entry) {
  if (typeof entry === 'string') return entry
  if (entry && typeof entry.require === 'string') return entry.require
  return null
}

function normalizeExtensionList (list) {
  if (!Array.isArray(list)) return []
  return list.map(normalizeExtensionId).filter(Boolean)
}

function displayName (id) {
  if (id.startsWith('@antora-supplemental/')) return id.slice('@antora-supplemental/'.length)
  if (id.startsWith('@antora/')) return id.slice('@antora/'.length)
  return id
}

function packageHome (id) {
  if (PACKAGE_HOME[id]) return PACKAGE_HOME[id]
  if (id.startsWith('@')) return `https://www.npmjs.com/package/${encodeURIComponent(id)}`
  return `https://www.npmjs.com/search?q=${encodeURIComponent(id)}`
}

function linksHtml (ids) {
  return ids
    .map((id) => {
      const label = displayName(id)
      const href = packageHome(id)
      return `<a href="${href}" target="_blank" rel="noopener">${label}</a>`
    })
    .join(' · ')
}

function inferUiBundle (bundleUrl) {
  const url = String(bundleUrl || '')
  for (const [name, home] of Object.entries(UI_BUNDLE_HOME)) {
    if (url.includes(name)) return { name, home }
  }
  return null
}

module.exports.register = function () {
  this.on('playbookBuilt', ({ playbook }) => {
    const keys = playbook.site.keys || (playbook.site.keys = {})

    const antoraIds = normalizeExtensionList(playbook.antora && playbook.antora.extensions)
    const asciidocIds = normalizeExtensionList(playbook.asciidoc && playbook.asciidoc.extensions)

    if (antoraIds.length) keys.build_stack_antora_html = linksHtml(antoraIds)
    if (asciidocIds.length) keys.build_stack_asciidoc_html = linksHtml(asciidocIds)

    if (!keys.ui_bundle_name) {
      const ui = inferUiBundle(playbook.ui && playbook.ui.bundle && playbook.ui.bundle.url)
      if (ui) {
        keys.ui_bundle_name = ui.name
        keys.ui_bundle_url = ui.home
      }
    }
  })
}
