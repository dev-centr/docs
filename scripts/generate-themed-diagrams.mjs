import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const name = 'nav-typology'
const imageDir = resolve('docs/modules/ROOT/images')
const config = resolve('docs/mermaid-config.json')
const check = process.argv.includes('--check')
const tools = {
  mmdc: resolve('node_modules/@mermaid-js/mermaid-cli/src/cli.js'),
  adapter: resolve('node_modules/@dev-centr/mermaid-svg-css-vars/bin/mermaid-svg-css-vars.js'),
}
const temporary = mkdtempSync(join(tmpdir(), 'docs-diagrams-'))

function normalizeAccessibility(path) {
  writeFileSync(path, readFileSync(path, 'utf8').replace(/\brole="[^"]*"/, 'role="img"'), 'utf8')
}

try {
  const raw = join(temporary, `${name}.raw.svg`)
  const fixed = join(imageDir, `${name}.fixed.svg`)
  if (!check && !existsSync(fixed)) copyFileSync(join(imageDir, `${name}.svg`), fixed)
  execFileSync(process.execPath, [tools.mmdc, '-i', join(imageDir, `${name}.mmd`), '-o', raw, '-c', config, '-b', 'transparent'], { stdio: 'inherit' })
  normalizeAccessibility(raw)
  execFileSync(
    process.execPath,
    [
      tools.adapter,
      '--manifest',
      join(imageDir, `${name}.theme.json`),
      '--dual-output',
      '--output',
      join(imageDir, `${name}.svg`),
      '--host-output',
      join(imageDir, `${name}.host.svg`),
      ...(check ? ['--check'] : []),
      raw,
    ],
    { stdio: 'inherit' },
  )
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
