import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const source = resolve('node_modules/@dev-centr/themed-svg/browser/themed-svg-element.js')
const destination = resolve('supplemental-ui/js/vendor/themed-svg-element.js')
const check = process.argv.includes('--check')

if (check) {
  const [published, committed] = await Promise.all([
    readFile(source),
    readFile(destination),
  ])
  if (!published.equals(committed)) {
    throw new Error('themed SVG browser runtime is stale; run pnpm diagrams:generate')
  }
} else {
  await mkdir(dirname(destination), { recursive: true })
  await copyFile(source, destination)
}
