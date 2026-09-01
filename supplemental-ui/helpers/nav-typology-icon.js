'use strict'

const navComponentLogo = require('./nav-component-logo')

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

function normalizeUrl (url) {
  if (url == null || url === '') return ''
  let u = String(url).split(/[?#]/)[0].toLowerCase()
  u = u.replace(/\/index\.html$/i, '/')
  if (u.length > 1) u = u.replace(/\/+$/, '') || '/'
  return u
}

function diataxisTitleDetectionEnabled ({ data } = {}) {
  const keys = (data && data.root && data.root.site && data.root.site.keys) || {}
  return keys.nav_typology_diataxis === 'true' || keys.nav_typology === 'true'
}

function detectDiataxisFromUrl (url) {
  if (/\/tutorials(\/|$)/.test(url)) return 'diataxis-tutorial'
  if (/\/how-to(\/|$)/.test(url)) return 'diataxis-howto'
  if (/\/reference(\/|$)/.test(url)) return 'diataxis-reference'
  if (/\/explanation(\/|$)/.test(url)) return 'diataxis-explanation'
  return null
}

function isComponentRoot (item, options = {}) {
  if (!item || typeof item !== 'object') return false
  if (item.navTypology?.id === 'component-root') return true
  const level = options.hash?.level ?? 0
  const depth = Number(level) || 0
  return depth === 0 && item.url && Array.isArray(item.items) && item.items.length > 0
}

function resolveTypology (item, options = {}) {
  if (!item || typeof item !== 'object') return null
  if (isComponentRoot(item, options)) return null
  if (item.navTypology?.id) {
    return TYPOLOGIES[item.navTypology.id] || item.navTypology
  }

  const level = options.hash?.level ?? 0
  const depth = Number(level) || 0
  const url = normalizeUrl(item.url)
  const text = String(item.content || '').toLowerCase()
  const diataxisTitles = diataxisTitleDetectionEnabled(options)

  let id = null
  if (/\/changelog(\/|$)/.test(url) || /\/activity-log(\/|$)/.test(url) || /^\.?\s*changelog\b/.test(text) || text === 'activity log') {
    id = 'changelog'
  } else {
    id = detectDiataxisFromUrl(url)
    if (!id && diataxisTitles) {
      if (/^\.?\s*tutorials\b/.test(text)) id = 'diataxis-tutorial'
      else if (/^\.?\s*how-to/.test(text)) id = 'diataxis-howto'
      else if (/^\.?\s*reference\b/.test(text)) id = 'diataxis-reference'
      else if (/^\.?\s*explanation\b/.test(text)) id = 'diataxis-explanation'
    }
  }

  if (!id) {
    if (/^\.?\s*components\b/i.test(text) || /\/components\//.test(url)) id = 'spec-component'
    else if (/^\.?\s*features\b/i.test(text) || /\/features\//.test(url)) id = 'spec-feature'
  }

  return id ? TYPOLOGIES[id] : null
}

module.exports = (item, options = {}) => {
  if (isComponentRoot(item, options)) {
    return navComponentLogo(item, options) || ''
  }
  const meta = resolveTypology(item, options)
  if (!meta) return ''
  const uiRoot = options.data?.root?.uiRootPath || options.data?.root?.siteRootPath || '/_'
  return (
    `<svg class="nav-typology-icon nav-typology-icon--${meta.id}" width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">` +
    `<use href="${uiRoot}/img/nav-typology.svg#${meta.spriteId}"/></svg>`
  )
}
