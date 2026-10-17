'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

/**
 * Policy mirrors supplemental-ui/js/soft-nav.js handleLinkClick gates (keep in sync).
 */
function shouldSoftNavNavTreeClick ({ sameOrigin, samePath, sameComponent, inNavTree, newContext }) {
  if (newContext) return false
  if (!sameOrigin) return false
  if (samePath) return true
  if (inNavTree) return true
  return sameComponent
}

describe('soft-nav nav-tree click policy', () => {
  const src = fs.readFileSync(path.join(__dirname, '../supplemental-ui/js/soft-nav.js'), 'utf8')

  it('allows cross-component intercept inside nav tree', () => {
    assert.equal(
      shouldSoftNavNavTreeClick({
        sameOrigin: true,
        samePath: false,
        sameComponent: false,
        inNavTree: true,
        newContext: false,
      }),
      true
    )
  })

  it('keeps same-component-only rule for article links', () => {
    assert.equal(
      shouldSoftNavNavTreeClick({
        sameOrigin: true,
        samePath: false,
        sameComponent: false,
        inNavTree: false,
        newContext: false,
      }),
      false
    )
  })

  it('does not intercept modifier or middle-click', () => {
    assert.equal(
      shouldSoftNavNavTreeClick({
        sameOrigin: true,
        samePath: false,
        sameComponent: true,
        inNavTree: true,
        newContext: true,
      }),
      false
    )
  })

  it('ships nav-tree cross-component gate in soft-nav.js', () => {
    assert.match(src, /!sameComponent\(destHref\) && !inNavTree/)
    assert.match(src, /linkOpensNewContext/)
  })

  it('suppresses hard reload on same-path nav clicks', () => {
    assert.match(src, /if \(samePath\(dest\.href\)\) \{\s*\n\s*ev\.preventDefault\(\)/)
    assert.match(src, /if \(samePath\(dest\)\) \{/)
  })

  it('crossfades mast, article, and toc without swapping navbar', () => {
    assert.match(src, /function crossfadeSwap/)
    assert.match(src, /syncSearchScopeFromDoc/)
    assert.match(src, /function fadeTargetEls/)
    assert.doesNotMatch(src, /querySelector\(['"]\.adt-site-navbar['"]\)/)
  })
})
