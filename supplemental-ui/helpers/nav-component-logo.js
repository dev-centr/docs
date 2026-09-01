'use strict'

/**
 * Optional per-component nav logos (site-nav-tree depth-0 roots and subtree items).
 * Map Antora component name → supplemental-ui/img/nav-logos/<file>.
 * Omit entries until a logo asset exists; colored expand chevrons mark component roots.
 */
const LOGOS = {
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
  const segment = path.replace(/^\/+/, '').split('/')[0]
  return segment || ''
}

module.exports = (item, options = {}) => {
  if (!item || typeof item !== 'object') return ''
  const name = componentNameFromUrl(item.url)
  if (!name) return ''
  const file = LOGOS[name]
  if (!file) return ''
  const uiRoot = options.data?.root?.uiRootPath || options.data?.root?.siteRootPath || '/_'
  return (
    `<img class="nav-component-logo" src="${uiRoot}/img/${file}" width="12" height="12" alt="" aria-hidden="true">`
  )
}

module.exports.componentNameFromUrl = componentNameFromUrl
