/**
 * Nav scroll A/B harness — CDP Performance metrics + rAF scroll on the left rail.
 * Usage:
 *   node scripts/nav-scroll-ab-bench.mjs [--url URL] [--out DIR]
 * Serves nothing; pass file:// or http(s) URLs. Local: start a static server first.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import http from 'node:http'
import { createReadStream, statSync, existsSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SITE = path.join(ROOT, 'build', 'site')
const OUT = path.resolve(process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(ROOT, 'build', 'nav-scroll-ab'))

const CHROME = process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
}

function startStaticServer (root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
        if (urlPath.endsWith('/')) urlPath += 'index.html'
        const filePath = normalize(join(root, urlPath))
        if (!filePath.startsWith(root)) {
          res.writeHead(403)
          res.end('forbidden')
          return
        }
        if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
          res.writeHead(404)
          res.end('missing')
          return
        }
        res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' })
        createReadStream(filePath).pipe(res)
      } catch (e) {
        res.writeHead(500)
        res.end(String(e))
      }
    })
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ server, base: `http://127.0.0.1:${port}` })
    })
  })
}

async function collectDomStats (page) {
  return page.evaluate(() => {
    const menu = document.querySelector('.nav-container [data-panel=menu]') ||
      document.querySelector('[data-panel=menu]') ||
      document.querySelector('.nav-panel-menu')
    const tree = document.querySelector('nav.nav-menu') || document.querySelector('.nav-menu')
    const icons = [...document.querySelectorAll('svg.nav-typology-icon')]
    const uses = [...document.querySelectorAll('svg.nav-typology-icon use')]
    const items = [...document.querySelectorAll('li.nav-item')]
    const visible = (el) => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) return false
      const st = getComputedStyle(el)
      if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false
      return true
    }
    const inCollapsed = (el) => {
      let n = el.parentElement
      while (n) {
        if (n.classList && n.classList.contains('nav-item') && !n.classList.contains('is-active')) {
          // inactive parents still show direct row; children ul may be hidden
        }
        if (n.matches && n.matches('ul.nav-list')) {
          const st = getComputedStyle(n)
          if (st.display === 'none' || st.height === '0px') return true
        }
        n = n.parentElement
      }
      return false
    }
    const overflowX = menu ? getComputedStyle(menu).overflowX : ''
    const overflowY = menu ? getComputedStyle(menu).overflowY : ''
    return {
      domNodes: document.getElementsByTagName('*').length,
      navItems: items.length,
      typologySvg: icons.length,
      typologyUse: uses.length,
      typologySvgVisible: icons.filter(visible).length,
      typologySvgInCollapsed: icons.filter(inCollapsed).length,
      navListUl: document.querySelectorAll('nav.nav-menu ul.nav-list').length,
      menuScrollHeight: menu ? menu.scrollHeight : 0,
      menuClientHeight: menu ? menu.clientHeight : 0,
      overflowX,
      overflowY,
      softNav: typeof window.SoftNav !== 'undefined',
      hasScrollListenerHint: !!(window.siteNavTreeSaveScroll),
      treeTextLen: tree ? (tree.textContent || '').length : 0,
    }
  })
}

async function applyVariant (page, variant) {
  if (variant === 'A-icons-on') return
  if (variant === 'B-icons-removed') {
    await page.evaluate(() => {
      document.querySelectorAll('svg.nav-typology-icon').forEach((el) => el.remove())
    })
    return
  }
  if (variant === 'C-icons-display-none') {
    await page.addStyleTag({
      content: 'svg.nav-typology-icon{display:none!important}',
    })
    return
  }
  if (variant === 'C2-css-mask-marks') {
    await page.evaluate(() => {
      document.querySelectorAll('svg.nav-typology-icon').forEach((el) => el.remove())
    })
    await page.addStyleTag({
      content: `
        li.nav-item.has-nav-typology > .nav-link > .nav-text::before,
        li.nav-item.has-nav-typology > .nav-text > .nav-typology-label::before {
          content: '';
          display: inline-block;
          width: 0.65em; height: 0.65em;
          margin-right: 0.35em;
          border-radius: 2px;
          background: currentColor;
          opacity: 0.55;
          flex: 0 0 auto;
        }
      `,
    })
    return
  }
  if (variant === 'D-softnav-scroll-disabled') {
    await page.evaluate(() => {
      // Clone panel to drop scroll listeners; stub SoftNav navigate.
      const el = document.querySelector('.nav-container [data-panel=menu]')
      if (el && el.parentNode) {
        const clone = el.cloneNode(true)
        el.parentNode.replaceChild(clone, el)
      }
      window.siteNavTreeSaveScroll = function () {}
      if (window.SoftNav) {
        window.SoftNav.navigate = function () { return Promise.resolve() }
        window.SoftNav.on = function () { return function () {} }
      }
      // Nuke capture scroll listeners by replacing document listeners is hard;
      // cloning the panel removes the panel scroll listener which is the hot path.
    })
    return
  }
  if (variant === 'E-expand-all') {
    await page.evaluate(() => {
      document.querySelectorAll('li.nav-item').forEach((li) => li.classList.add('is-active'))
    })
    return
  }
  if (variant === 'E2-collapse-nonpath') {
    await page.evaluate(() => {
      document.querySelectorAll('li.nav-item').forEach((li) => {
        if (!li.classList.contains('is-current-path') && !li.classList.contains('is-current-page')) {
          li.classList.remove('is-active')
        }
      })
    })
    return
  }
  if (variant === 'F-force-overflow-x-auto') {
    await page.addStyleTag({
      content: `
        .nav-panel-menu, nav.nav-menu.nav-tree-only {
          overflow-x: auto !important;
          white-space: nowrap;
        }
        nav.nav-menu .nav-link, nav.nav-menu .nav-text {
          white-space: nowrap !important;
          overflow-wrap: normal !important;
          word-break: normal !important;
        }
      `,
    })
    return
  }
  if (variant === 'G-no-box-shadow-filter') {
    await page.addStyleTag({
      content: `
        .nav-container, .nav, .nav-panel-menu, .nav-item, .nav-link, .nav-item-toggle {
          box-shadow: none !important;
          filter: none !important;
          backdrop-filter: none !important;
          text-shadow: none !important;
        }
      `,
    })
    return
  }
}

async function scrollBench (page, { durationMs = 1800, stepPx = 48 } = {}) {
  // Enable CDP Performance + tracing-ish metrics
  const client = await page.createCDPSession()
  await client.send('Performance.enable')
  await client.send('Overlay.setShowFPSCounter', { show: false }).catch(() => {})

  // Clear prior metrics baseline
  await client.send('Performance.disable').catch(() => {})
  await client.send('Performance.enable')

  const before = await client.send('Performance.getMetrics')
  const beforeMap = Object.fromEntries(before.metrics.map((m) => [m.name, m.value]))

  const scrollResult = await page.evaluate(async ({ durationMs, stepPx }) => {
    const menu = document.querySelector('.nav-container [data-panel=menu]') ||
      document.querySelector('[data-panel=menu]')
    if (!menu) return { error: 'no-menu', frames: 0 }

    menu.scrollTop = 0
    const max = Math.max(0, menu.scrollHeight - menu.clientHeight)
    const frames = []
    let last = performance.now()
    let longTasks = 0
    let scriptingApprox = 0

    // Long-task observer during scroll
    let observer
    try {
      observer = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.duration >= 50) longTasks++
        }
      })
      observer.observe({ entryTypes: ['longtask'] })
    } catch (_) { /* unsupported */ }

    const t0 = performance.now()
    let dir = 1
    let y = 0
    while (performance.now() - t0 < durationMs) {
      y += dir * stepPx
      if (y >= max) { y = max; dir = -1 }
      if (y <= 0) { y = 0; dir = 1 }
      const s0 = performance.now()
      menu.scrollTop = y
      // force layout read
      void menu.scrollTop
      void menu.getBoundingClientRect()
      const mid = performance.now()
      await new Promise((r) => requestAnimationFrame(r))
      const now = performance.now()
      const frameMs = now - last
      frames.push(frameMs)
      scriptingApprox += mid - s0
      last = now
      if (frameMs >= 50) longTasks++
    }
    if (observer) observer.disconnect()

    const sorted = frames.slice().sort((a, b) => a - b)
    const pct = (p) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0
    const avg = frames.length ? frames.reduce((a, b) => a + b, 0) / frames.length : 0
    const dropped = frames.filter((f) => f > 1000 / 55).length
    return {
      frames: frames.length,
      avgFrameMs: avg,
      p50FrameMs: pct(0.5),
      p95FrameMs: pct(0.95),
      p99FrameMs: pct(0.99),
      maxFrameMs: sorted.length ? sorted[sorted.length - 1] : 0,
      fpsEst: avg > 0 ? 1000 / avg : 0,
      droppedBelow55fps: dropped,
      longTasks,
      scriptingApproxMs: scriptingApprox,
      scrollRangePx: max,
      durationMs: performance.now() - t0,
    }
  }, { durationMs, stepPx })

  const after = await client.send('Performance.getMetrics')
  const afterMap = Object.fromEntries(after.metrics.map((m) => [m.name, m.value]))

  const delta = (name) => (afterMap[name] ?? 0) - (beforeMap[name] ?? 0)

  // Layout/style recalc from Chrome metrics (cumulative seconds → ms)
  const metrics = {
    LayoutCount: delta('LayoutCount'),
    LayoutDurationMs: delta('LayoutDuration') * 1000,
    RecalcStyleCount: delta('RecalcStyleCount'),
    RecalcStyleDurationMs: delta('RecalcStyleDuration') * 1000,
    ScriptDurationMs: delta('ScriptDuration') * 1000,
    TaskDurationMs: delta('TaskDuration') * 1000,
    TaskOtherDurationMs: delta('TaskOtherDuration') * 1000,
    JSHeapUsedSize: afterMap.JSHeapUsedSize,
    Nodes: afterMap.Nodes,
    JSEventListeners: afterMap.JSEventListeners,
  }

  return { scroll: scrollResult, cdp: metrics }
}

async function runOne (browser, { label, url, variant, viewport }) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  page.setDefaultNavigationTimeout(60000)
  const started = Date.now()
  let navErr = null
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  } catch (e) {
    navErr = String(e)
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }) } catch (e2) {
      navErr += ' | ' + String(e2)
    }
  }
  // let SoftNav / site-nav-tree settle
  await new Promise(r => setTimeout(r, 400))
  await applyVariant(page, variant)
  await new Promise(r => setTimeout(r, 150))
  const dom = await collectDomStats(page)
  const bench = await scrollBench(page, { durationMs: 2000, stepPx: 64 })

  // optional screenshot of nav region
  const shotPath = path.join(OUT, `${label}.png`)
  try {
    const menu = await page.$('.nav-container')
    if (menu) await menu.screenshot({ path: shotPath })
    else await page.screenshot({ path: shotPath, fullPage: false })
  } catch (_) { /* ignore */ }

  await page.close()
  return {
    label,
    url,
    variant,
    navErr,
    elapsedMs: Date.now() - started,
    dom,
    ...bench,
    screenshot: shotPath,
  }
}

async function main () {
  fs.mkdirSync(OUT, { recursive: true })
  const { server, base } = await startStaticServer(SITE)
  const localDeep = `${base}/tools/agent-rules/`
  const localHome = `${base}/home/`
  const liveDeep = 'https://docs.devcentr.org/tools/agent-rules/'
  const hci = 'https://hci-nerdz.github.io/docs/hci-nerdz/index.html'

  const viewport = { width: 1440, height: 900, deviceScaleFactor: 1 }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: existsSync(CHROME) ? CHROME : undefined,
    args: [
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--force-device-scale-factor=1',
      '--disable-lcd-text',
    ],
  })

  const jobs = [
    { label: '01-local-A-icons-on', url: localDeep, variant: 'A-icons-on' },
    { label: '02-local-B-icons-removed', url: localDeep, variant: 'B-icons-removed' },
    { label: '03-local-C-icons-display-none', url: localDeep, variant: 'C-icons-display-none' },
    { label: '04-local-C2-css-mask-marks', url: localDeep, variant: 'C2-css-mask-marks' },
    { label: '05-local-D-softnav-scroll-off', url: localDeep, variant: 'D-softnav-scroll-disabled' },
    { label: '06-local-E-expand-all', url: localDeep, variant: 'E-expand-all' },
    { label: '07-local-E2-collapse-nonpath', url: localDeep, variant: 'E2-collapse-nonpath' },
    { label: '08-local-F-overflow-x-auto', url: localDeep, variant: 'F-force-overflow-x-auto' },
    { label: '09-local-G-no-shadow-filter', url: localDeep, variant: 'G-no-box-shadow-filter' },
    { label: '10-local-home-A', url: localHome, variant: 'A-icons-on' },
    { label: '11-live-A', url: liveDeep, variant: 'A-icons-on' },
    { label: '12-live-B-icons-removed', url: liveDeep, variant: 'B-icons-removed' },
    { label: '13-hci-control', url: hci, variant: 'A-icons-on' },
  ]

  const results = []
  for (const job of jobs) {
    process.stdout.write(`Running ${job.label}...\n`)
    try {
      const r = await runOne(browser, { ...job, viewport })
      results.push(r)
      const s = r.scroll || {}
      process.stdout.write(
        `  fps=${(s.fpsEst || 0).toFixed(1)} p95=${(s.p95FrameMs || 0).toFixed(1)}ms ` +
        `layout=${r.cdp?.LayoutDurationMs?.toFixed?.(1)} style=${r.cdp?.RecalcStyleDurationMs?.toFixed?.(1)} ` +
        `svg=${r.dom?.typologySvg} vis=${r.dom?.typologySvgVisible}\n`
      )
    } catch (e) {
      results.push({ label: job.label, error: String(e), url: job.url, variant: job.variant })
      process.stdout.write(`  ERROR ${e}\n`)
    }
  }

  await browser.close()
  server.close()

  const summary = {
    generatedAt: new Date().toISOString(),
    tipShaHint: '7d69041',
    method: {
      browser: 'Chrome headless via Puppeteer',
      scroll: 'programmatic scrollTop + rAF on [data-panel=menu], 2s, 64px steps',
      metrics: 'rAF frame intervals + CDP Performance.getMetrics deltas',
      limits: [
        'Headless Chrome may differ from GPU-composited interactive scrolling',
        'Runtime DOM mutations approximate build-time nav_typology_icons=false',
        'Long-task observer may be unavailable in some Chrome builds',
      ],
    },
    results,
  }

  const jsonPath = path.join(OUT, 'results.json')
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2))

  // Markdown table for article paste
  const rows = results.map((r) => {
    if (r.error) return `| ${r.label} | ERROR | | | | | | |`
    const s = r.scroll || {}
    return `| ${r.label} | ${(s.fpsEst || 0).toFixed(1)} | ${(s.p50FrameMs || 0).toFixed(1)} | ${(s.p95FrameMs || 0).toFixed(1)} | ${(s.maxFrameMs || 0).toFixed(1)} | ${(r.cdp?.LayoutDurationMs || 0).toFixed(1)} | ${(r.cdp?.RecalcStyleDurationMs || 0).toFixed(1)} | ${r.dom?.typologySvg}/${r.dom?.typologySvgVisible} | ${r.dom?.domNodes} |`
  })
  const md = [
    '# Nav scroll A/B results',
    '',
    `| variant | FPS est | p50 ms | p95 ms | max ms | Layout ms | Style ms | SVG tot/vis | DOM nodes |`,
    `|---|---:|---:|---:|---:|---:|---:|---|---:|`,
    ...rows,
    '',
    `Full JSON: ${jsonPath}`,
  ].join('\n')
  fs.writeFileSync(path.join(OUT, 'results.md'), md)
  process.stdout.write(`\nWrote ${jsonPath}\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

