'use strict'

const { resolveTypology } = require('./nav-typology-resolve')

module.exports = (item, options = {}) => {
  if (item?.navTypology?.id) {
    if (item.navTypology.id === 'component-root') return ''
    return item.navTypology.id
  }
  const meta = resolveTypology(item, options)
  return meta ? meta.id : ''
}
