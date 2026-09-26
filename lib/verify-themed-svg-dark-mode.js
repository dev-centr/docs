'use strict'

const fs = require('node:fs')
const path = require('node:path')

/**
 * Antora extension: WARN when Themed SVG adaptive images lack dark-mode text theming.
 *
 * Borrow-from-light: dark preset may reuse light values (optional borrowFromLight[]).
 * Parent -> child: light-stable surfaces keep nested text stable; WARN when a changed
 * darker surface/canvas still has light-mode text left behind.
 */

function normalizeColor (value) {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase().replace(/\s+/g, '')
}

function sameColor (a, b) {
  return normalizeColor(a) !== '' && normalizeColor(a) === normalizeColor(b)
}

function borrowedTokenIds (manifest) {
  const out = new Set()
  if (!manifest?.presets?.light || !manifest?.presets?.dark) return out
  const { light, dark } = manifest.presets
  for (const id of Object.keys(light)) {
    if (Object.prototype.hasOwnProperty.call(dark, id) && sameColor(light[id], dark[id])) out.add(id)
  }
  const explicit = manifest.borrowFromLight || manifest['x-devcentr-borrow-from-light'] || []
  if (Array.isArray(explicit)) for (const id of explicit) out.add(id)
  return out
}

function textTokensInside (surfaceToken, allTokenIds) {
  const ids = allTokenIds instanceof Set ? allTokenIds : new Set(allTokenIds)
  const related = []
  if (surfaceToken === 'color.canvas') {
    for (const id of ids) {
      if (id === 'color.text.primary' || id === 'color.text.muted') related.push(id)
    }
    return related
  }
  const m = surfaceToken.match(/^color\.surface\.(.+)$/)
  if (!m) return related
  const leaf = m[1]
  for (const candidate of [`color.text.on-${leaf}`, `color.text.${leaf}`, `color.text.on.${leaf}`]) {
    if (ids.has(candidate)) related.push(candidate)
  }
  return related
}

function isDarkerBackground (lightHex, darkHex) {
  const lum = (hex) => {
    const h = normalizeColor(hex).replace('#', '')
    if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/.test(h)) return null
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    const r = parseInt(full.slice(0, 2), 16) / 255
    const g = parseInt(full.slice(2, 4), 16) / 255
    const b = parseInt(full.slice(4, 6), 16) / 255
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const a = lum(lightHex)
  const b = lum(darkHex)
  if (a == null || b == null) return darkHex !== lightHex
  return b < a - 0.05
}

function findDarkModeTextGaps (svg, fileLabel, manifest) {
  const gaps = []
  if (!/prefers-color-scheme:\s*dark/.test(svg)) return gaps
  if (!svg.includes('--themed-svg-')) {
    gaps.push(`${fileLabel}: has dark media query but no --themed-svg-* variables`)
    return gaps
  }

  const nsMatch = svg.match(/--themed-svg-([a-z0-9-]+)-color-text-primary/)
  const ns = (manifest && manifest.namespace) || (nsMatch && nsMatch[1])
  const textVar = ns
    ? new RegExp(`fill:var\\(--themed-svg-${ns}-color-text-primary`)
    : /fill:var\(--themed-svg-[a-z0-9-]+-color-text-primary/

  const borrowed = borrowedTokenIds(manifest)
  const light = (manifest && manifest.presets && manifest.presets.light) || {}
  const dark = (manifest && manifest.presets && manifest.presets.dark) || {}
  const allIds = new Set([...Object.keys(light), ...Object.keys(dark)])

  const canvasBorrowed = borrowed.has('color.canvas')
  const textPrimaryBorrowed = borrowed.has('color.text.primary')
  const lightStableFigure = canvasBorrowed && textPrimaryBorrowed
  const canvasChangedToDark =
    light['color.canvas'] &&
    dark['color.canvas'] &&
    !canvasBorrowed &&
    isDarkerBackground(light['color.canvas'], dark['color.canvas'])

  const rootRule = svg.match(/#my-svg\{[^}]*\}/)
  if (rootRule) {
    const hardcoded = /fill:\s*#([0-9a-fA-F]{3,8})|fill:\s*rgb\(/.test(rootRule[0]) && !textVar.test(rootRule[0])
    if (hardcoded && !lightStableFigure) {
      gaps.push(
        `${fileLabel}: root #my-svg fill is a hardcoded color (not color.text.primary var); <text> inherits it in dark mode`
      )
    }
  }

  const labelRule = svg.match(/#my-svg \.label\{[^}]*\}/)
  if (
    labelRule &&
    /color:\s*#([0-9a-fA-F]{3,8})|color:\s*rgb\(0,\s*0,\s*0\)/.test(labelRule[0]) &&
    !/color:var\(--themed-svg-/.test(labelRule[0]) &&
    !lightStableFigure
  ) {
    gaps.push(`${fileLabel}: #my-svg .label color is hardcoded (not a themed-svg text var)`)
  }

  if (canvasChangedToDark && textPrimaryBorrowed) {
    gaps.push(
      `${fileLabel}: color.canvas changes in dark mode but color.text.primary still borrows light (dark background with light-mode text)`
    )
  }

  for (const surfaceId of allIds) {
    if (!surfaceId.startsWith('color.surface.')) continue
    const childTextIds = textTokensInside(surfaceId, allIds)
    for (const textId of childTextIds) {
      if (!light[textId] || !dark[textId]) continue
      const surfaceBorrowed = borrowed.has(surfaceId)
      const textBorrowed = borrowed.has(textId)
      const surfaceChanged =
        light[surfaceId] && dark[surfaceId] && !surfaceBorrowed && !sameColor(light[surfaceId], dark[surfaceId])
      if (surfaceBorrowed && !textBorrowed && !sameColor(light[textId], dark[textId])) {
        gaps.push(
          `${fileLabel}: ${surfaceId} borrows light in dark mode but ${textId} still changes — nested text inside a light-stable region should also borrow light`
        )
      }
      if (surfaceChanged && isDarkerBackground(light[surfaceId], dark[surfaceId]) && textBorrowed) {
        gaps.push(
          `${fileLabel}: ${surfaceId} changes in dark mode but ${textId} still borrows light (adapted surface with light-mode text left behind)`
        )
      }
    }
  }

  return gaps
}

function loadSiblingManifest (svgPath) {
  if (!svgPath) return null
  const themePath = svgPath.replace(/\.svg$/i, '.theme.json')
  try {
    if (fs.existsSync(themePath)) return JSON.parse(fs.readFileSync(themePath, 'utf8'))
  } catch {
    /* ignore */
  }
  return null
}

module.exports.register = function () {
  this.on('contentClassified', ({ contentCatalog }) => {
    const logger = this.getLogger('themed-svg-dark-text')
    let warned = 0
    for (const file of contentCatalog.getFiles()) {
      const srcPath = file.src && file.src.path ? file.src.path : file.path
      if (!srcPath || !srcPath.endsWith('.svg')) continue
      if (/\.(host|fixed)\.svg$/.test(srcPath)) continue

      let svg
      try {
        svg = file.contents.toString('utf8')
      } catch {
        continue
      }
      if (!svg.includes('prefers-color-scheme')) continue

      const abspath = file.src && file.src.abspath ? file.src.abspath : null
      const manifest = loadSiblingManifest(abspath)
      const label = abspath || srcPath
      for (const gap of findDarkModeTextGaps(svg, label, manifest)) {
        logger.warn(gap)
        warned += 1
      }
    }
    if (warned > 0) {
      logger.warn(
        `themed-svg dark-mode text: ${warned} issue(s) — bind adapted surfaces to color.text.* vars; use borrow-from-light for intentional light islands (see antora-diagram-formats)`
      )
    }
  })
}

module.exports.findDarkModeTextGaps = findDarkModeTextGaps
module.exports.borrowedTokenIds = borrowedTokenIds