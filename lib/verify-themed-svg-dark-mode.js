'use strict'

/**
 * Antora extension: WARN when Themed SVG adaptive images lack dark-mode text theming.
 *
 * Pipeline context: Mermaid/PlantUML → adapter → *.svg (adaptive) + *.host.svg;
 * pages mark figures [.themed-svg]; supplemental site-themed-svg.js inlines the host SVG.
 * Adaptive <img> fallbacks still need @media (prefers-color-scheme: dark) text vars —
 * Mermaid's hardcoded #my-svg { fill } / .label { color } otherwise stay dark-on-dark.
 */

function findDarkModeTextGaps (svg, fileLabel) {
  const gaps = []
  if (!/prefers-color-scheme:\s*dark/.test(svg)) {
    // Not an adaptive themed diagram — skip silently.
    return gaps
  }
  if (!svg.includes('--themed-svg-')) {
    gaps.push(`${fileLabel}: has dark media query but no --themed-svg-* variables`)
    return gaps
  }

  const nsMatch = svg.match(/--themed-svg-([a-z0-9-]+)-color-text-primary/)
  const ns = nsMatch && nsMatch[1]
  const textVar = ns
    ? new RegExp(`fill:var\\(--themed-svg-${ns}-color-text-primary`)
    : /fill:var\(--themed-svg-[a-z0-9-]+-color-text-primary/

  const rootRule = svg.match(/#my-svg\{[^}]*\}/)
  if (rootRule) {
    if (/fill:\s*#([0-9a-fA-F]{3,8})|fill:\s*rgb\(/.test(rootRule[0]) && !textVar.test(rootRule[0])) {
      gaps.push(
        `${fileLabel}: root #my-svg fill is a hardcoded color (not color.text.primary var); <text> inherits it in dark mode`
      )
    }
  }

  const labelRule = svg.match(/#my-svg \.label\{[^}]*\}/)
  if (
    labelRule &&
    /color:\s*#([0-9a-fA-F]{3,8})|color:\s*rgb\(0,\s*0,\s*0\)/.test(labelRule[0]) &&
    !/color:var\(--themed-svg-/.test(labelRule[0])
  ) {
    gaps.push(`${fileLabel}: #my-svg .label color is hardcoded (not a themed-svg text var)`)
  }

  if (ns) {
    const darkBlock = svg.match(/@media \(prefers-color-scheme:dark\)\{[^}]*\{([^}]*)\}/)
    if (darkBlock && !new RegExp(`--themed-svg-${ns}-color-text-primary`).test(darkBlock[0])) {
      gaps.push(`${fileLabel}: dark preset missing --themed-svg-${ns}-color-text-primary`)
    }
  }

  return gaps
}

module.exports.register = function () {
  this.on('contentClassified', ({ contentCatalog }) => {
    const logger = this.getLogger('themed-svg-dark-text')
    let warned = 0
    for (const file of contentCatalog.getFiles()) {
      const path = file.src && file.src.path ? file.src.path : file.path
      if (!path || !path.endsWith('.svg')) continue
      if (/\.(host|fixed)\.svg$/.test(path)) continue
      if (file.family && file.family !== 'image' && file.src && file.src.family !== 'image') continue

      let svg
      try {
        svg = file.contents.toString('utf8')
      } catch {
        continue
      }
      if (!svg.includes('prefers-color-scheme')) continue

      const label = file.src && file.src.abspath ? file.src.abspath : path
      for (const gap of findDarkModeTextGaps(svg, label)) {
        logger.warn(gap)
        warned += 1
      }
    }
    if (warned > 0) {
      logger.warn(
        `themed-svg dark-mode text: ${warned} issue(s) — bind Mermaid #my-svg fill / .label color to color.text.primary in the diagram theme.json and regenerate`
      )
    }
  })
}

module.exports.findDarkModeTextGaps = findDarkModeTextGaps