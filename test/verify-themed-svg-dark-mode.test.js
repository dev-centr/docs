'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  findDarkModeTextGaps,
  borrowedTokenIds,
  pictureName,
} = require('../lib/verify-themed-svg-dark-mode.js')

describe('pictureName', () => {
  it('uses basename', () => {
    assert.equal(pictureName('/x/y/agent-cli-auth-flow.svg'), 'agent-cli-auth-flow.svg')
  })
})

describe('findDarkModeTextGaps', () => {
  it('warns in plain language when root fill is hardcoded', () => {
    const svg = [
      '@media (prefers-color-scheme: dark) { :root { --themed-svg-demo-color-canvas: #111; } }',
      '#my-svg{fill:#000000}',
    ].join('')
    const gaps = findDarkModeTextGaps(svg, 'modules/ROOT/images/demo.svg', {
      namespace: 'demo',
      presets: {
        light: { 'color.canvas': '#ffffff', 'color.text.primary': '#000000' },
        dark: { 'color.canvas': '#111111', 'color.text.primary': '#eeeeee' },
      },
    })
    assert.ok(gaps.length >= 1)
    assert.match(gaps[0], /Dark-mode picture demo\.svg still has dark text that will be hard to read/)
    for (const g of gaps) {
      assert.doesNotMatch(g, /color\.text\.primary|themed-svg-|hardcoded|#my-svg/)
    }
  })

  it('skips light-stable figures that borrow canvas and text', () => {
    const svg = [
      '@media (prefers-color-scheme: dark) { :root { --themed-svg-demo-color-canvas: #fff; } }',
      '#my-svg{fill:#000000}',
    ].join('')
    const gaps = findDarkModeTextGaps(svg, 'access-mock.svg', {
      namespace: 'demo',
      presets: {
        light: { 'color.canvas': '#ffffff', 'color.text.primary': '#000000' },
        dark: { 'color.canvas': '#ffffff', 'color.text.primary': '#000000' },
      },
      borrowFromLight: ['color.canvas', 'color.text.primary'],
    })
    assert.deepEqual(gaps, [])
  })

  it('returns empty when no dark media query', () => {
    assert.deepEqual(findDarkModeTextGaps('#my-svg{fill:#000}', 'x.svg', null), [])
  })
})

describe('borrowedTokenIds', () => {
  it('marks equal light/dark values as borrowed', () => {
    const ids = borrowedTokenIds({
      presets: {
        light: { 'color.canvas': '#fff', 'color.text.primary': '#000' },
        dark: { 'color.canvas': '#fff', 'color.text.primary': '#eee' },
      },
    })
    assert.ok(ids.has('color.canvas'))
    assert.ok(!ids.has('color.text.primary'))
  })
})