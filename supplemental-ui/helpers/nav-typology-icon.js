'use strict'

const { resolveTypologyId: resolveTypologyIdCore } = require('@antora-supplemental/nav-typology/lib/resolve-typology')

const TYPOLOGIES = {
  'component-root': { id: 'component-root', spriteId: 'icon-component-root', label: 'Component' },
  'spec-component': { id: 'spec-component', spriteId: 'icon-spec-component', label: 'Component spec' },
  'spec-feature': { id: 'spec-feature', spriteId: 'icon-spec-feature', label: 'Feature spec' },
  'diataxis-tutorial': { id: 'diataxis-tutorial', spriteId: 'icon-diataxis-tutorial', label: 'Tutorial' },
  'diataxis-howto': { id: 'diataxis-howto', spriteId: 'icon-diataxis-howto', label: 'How-to' },
  'diataxis-reference': { id: 'diataxis-reference', spriteId: 'icon-diataxis-reference', label: 'Reference' },
  'diataxis-explanation': {
    id: 'diataxis-explanation',
    spriteId: 'icon-diataxis-explanation',
    label: 'Explanation',
  },
  changelog: {
    id: 'changelog',
    spriteId: 'icon-changelog',
    label: 'Changelog',
  },
}

/** @see nav-component-logo.js — inlined here; Antora requireFromString cannot resolve sibling helpers. */
const COMPONENT_LOGOS = {
  DevCentr: 'nav-logos/devcentr.svg',
  'devcentr-org': 'nav-logos/devcentr-org.svg',
}

function normalizeUrl (url) {
  if (url == null || url === '') return ''
  let u = String(url).split(/[?#]/)[0]
  u = u.replace(/\/index\.html$/i, '/')
  if (u.length > 1) u = u.replace(/\/+$/, '') || '/'
  return u
}

function componentNameFromUrl (url) {
  const path = normalizeUrl(url)
  if (!path || path === '/') return ''
  return path.replace(/^\/+/, '').split('/')[0] || ''
}

function diataxisEnabled ({ data } = {}) {
  const keys = (data && data.root && data.root.site && data.root.site.keys) || {}
  return keys.nav_typology_diataxis === 'true' || keys.nav_typology === 'true'
}

function isComponentRoot (item, options = {}) {
  if (!item || typeof item !== 'object') return false
  if (item.navTypology?.id === 'component-root') return true
  const level = options.hash?.level ?? 0
  const depth = Number(level) || 0
  return depth === 0 && item.url && Array.isArray(item.items) && item.items.length > 0
}

function componentLogoMarkup (item, options = {}) {
  const name = componentNameFromUrl(item.url)
  const file = name && COMPONENT_LOGOS[name]
  if (!file) return ''
  const uiRoot = options.data?.root?.uiRootPath || options.data?.root?.siteRootPath || '/_'
  return (
    `<img class="nav-component-logo" src="${uiRoot}/img/${file}" width="12" height="12" alt="" aria-hidden="true">`
  )
}

function resolveTypology (item, options = {}) {
  if (!item || typeof item !== 'object') return null
  if (isComponentRoot(item, options)) return null

  const parentTypologyId = options.hash?.parentTypologyId || ''
  const id = resolveTypologyIdCore(item, {
    parentTypologyId,
    diataxisEnabled: diataxisEnabled(options),
    skipBuildFallback: false,
  })

  return id && TYPOLOGIES[id] ? TYPOLOGIES[id] : null
}

module.exports = (item, options = {}) => {
  if (isComponentRoot(item, options)) {
    return componentLogoMarkup(item, options) || ''
  }
  const meta = resolveTypology(item, options)
  if (!meta) return ''
  const uiRoot = options.data?.root?.uiRootPath || options.data?.root?.siteRootPath || '/_'
  return (
    `<svg class="nav-typology-icon nav-typology-icon--${meta.id}" width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">` +
    `<use href="${uiRoot}/img/nav-typology.svg#${meta.spriteId}"/></svg>`
  )
}
