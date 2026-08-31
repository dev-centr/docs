'use strict'

/**
 * True when a component name belongs in the curated site-nav-tree forest.
 * Reads site.keys.site_nav_tree_include / _exclude published by the extension.
 * No include list → all components except exclude (legacy all-forest mode).
 */
module.exports = (name, { data } = {}) => {
  if (name == null || name === '') return false
  const keys = (data && data.root && data.root.site && data.root.site.keys) || {}
  const split = (v) =>
    String(v || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  const include = split(keys.site_nav_tree_include)
  const exclude = split(keys.site_nav_tree_exclude)
  const n = String(name)
  if (exclude.includes(n)) return false
  if (include.length) return include.includes(n)
  return true
}
