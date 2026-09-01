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

function resolveId (item, options = {}) {
  if (!item || typeof item !== 'object') return ''
  if (isComponentRoot(item, options)) return ''

  const parentTypologyId = options.hash?.parentTypologyId || ''
  const id = resolveTypologyIdCore(item, {
    parentTypologyId,
    diataxisEnabled: diataxisEnabled(options),
    skipBuildFallback: false,
  })

  return id && TYPOLOGIES[id] ? id : ''
}

module.exports = (item, options = {}) => resolveId(item, options)
