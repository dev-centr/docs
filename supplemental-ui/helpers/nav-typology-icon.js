'use strict'

const { resolveTypology } = require('./nav-typology-resolve')

module.exports = (item, options = {}) => {
  const meta = resolveTypology(item, options)
  if (!meta) return ''
  const uiRoot = options.data?.root?.uiRootPath || options.data?.root?.siteRootPath || '/_'
  return (
    `<svg class="nav-typology-icon nav-typology-icon--${meta.id}" width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">` +
    `<use href="${uiRoot}/img/nav-typology.svg#${meta.spriteId}"/></svg>`
  )
}
