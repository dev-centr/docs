/**
 * Deeper nav cost bench: Chrome tracing, forced style/layout, wheel events,
 * scroll-listener sessionStorage cost. Complements nav-scroll-ab-bench.mjs.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import { createReadStream, statSync, existsSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SITE = path.join(ROOT, 'build', 'site')
const OUT = path.join(ROOT, 'build', 'nav-scroll-ab')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
}

function startStaticServer (root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
        if (urlPath.endsWith('/')) urlPath += 'index.html'
        const filePath = normalize(join(root, urlPath))
        if (!filePath.startsWith(root)) { res.writeHead(403); res.end('forbidden'); return }
        if (!existsSync(filePath) || statSync(filePath).isDirectory()) { res.writeHead(404); res.end('missing'); return }
        res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' })
        createReadStream(filePath).pipe(res)
      } catch (e) { res.writeHead(500); res.end(String(e)) }
    })
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, base: `http://127.0.0.1:${server.address().port}` })
    })
  })
}

async function applyVariant (page, variant) {
  if (variant === 'A') return
  if (variant === 'B-remove-svg') {
    await page.evaluate(() => document.querySelectorAll('svg.nav-typology-icon').forEach((e) => e.remove()))
  } else if (variant === 'C-hide-svg') {
    await page.addStyleTag({ content: 'svg.nav-typology-icon{display:none!important}' })
  } else if (variant === 'D-no-scroll-persist') {
    await page.evaluate(() => {
      const el = document.querySelector('.nav-container [data-panel=menu]')
      if (el && el.parentNode) el.parentNode.replaceChild(el.cloneNode(true), el)
      window.siteNavTreeSaveScroll = function () {}
      const raw = sessionStorage.setItem.bind(sessionStorage)
      sessionStorage.setItem = function (k, v) {
        if (String(k).startsWith('site-nav-tree:')) return
        return raw(k, v)
      }
    })
  } else if (variant === 'E-expand-all') {
    await page.evaluate(() => document.querySelectorAll('li.nav-item').forEach((li) => li.classList.add('is-active')))
  } else if (variant === 'E-expand-all-no-svg') {
    await page.evaluate(() => {
      document.querySelectorAll('li.nav-item').forEach((li) => li.classList.add('is-active'))
      document.querySelectorAll('svg.nav-typology-icon').forEach((e) => e.remove())
    })
  } else if (variant === 'F-overflow-x') {
    await page.addStyleTag({ content: `
      .nav-panel-menu { overflow-x: auto !important; }
      nav.nav-menu .nav-link, nav.nav-menu .nav-text { white-space: nowrap !important; overflow-wrap: normal !important; }
    ` })
  }
}

function summarizeTraceEvents (events) {
  const byName = Object.create(null)
  const durations = Object.create(null)
  for (const e of events) {
    if (!e || !e.name) continue
    byName[e.name] = (byName[e.name] || 0) + 1
    if (typeof e.dur === 'number') {
      durations[e.name] = (durations[e.name] || 0) + e.dur / 1000
    }
  }
  const pick = [
    'RunTask', 'FunctionCall', 'EvaluateScript', 'EventDispatch',
    'UpdateLayoutTree', 'Layout', 'Paint', 'PaintImage', 'Layerize',
    'PrePaint', 'Commit', 'CompositeLayers', 'HitTest',
    'ScheduleStyleRecalculation', 'UpdateLayerTree', 'ScrollLayer',
    'GPUTask', 'RasterTask', 'FireAnimationFrame',
  ]
  const out = {}
  for (const n of pick) {
    if (byName[n] || durations[n]) {
      out[n] = { count: byName[n] || 0, ms: +(durations[n] || 0).toFixed(3) }
    }
  }
  const top = Object.entries(durations).sort((a, b) => b[1] - a[1]).slice(0, 15)
    .map(([name, ms]) => ({ name, ms: +ms.toFixed(3), count: byName[name] || 0 }))
  return { selected: out, topDuration: top, eventCount: events.length }
}

async function withTrace (page, fn) {
  const client = await page.createCDPSession()
  const events = []
  const onData = (params) => {
    const v = params && params.value
    if (Array.isArray(v)) events.push(...v)
    else if (v) events.push(v)
  }
  client.on('Tracing.dataCollected', onData)
  const complete = new Promise((resolve) => {
    client.on('Tracing.tracingComplete', () => resolve())
  })
  await client.send('Tracing.start', {
    categories: [
      'devtools.timeline',
      'disabled-by-default-devtools.timeline',
      'disabled-by-default-devtools.timeline.frame',
      'blink.user_timing',
      'v8.execute',
    ].join(','),
    options: 'record-as-much-as-possible',
  })
  try {
    await fn(client)
  } finally {
    await client.send('Tracing.end')
    await Promise.race([complete, new Promise((r) => setTimeout(r, 5000))])
    client.off('Tracing.dataCollected', onData)
  }
  return summarizeTraceEvents(events)
}

async function costMicrobench (page) {
  return page.evaluate(() => {
    const menu = document.querySelector('.nav-container [data-panel=menu]') || document.querySelector('[data-panel=menu]')
    const icons = [...document.querySelectorAll('svg.nav-typology-icon')]
    const items = [...document.querySelectorAll('li.nav-item')]
    const links = [...document.querySelectorAll('nav.nav-menu .nav-link, nav.nav-menu .nav-text')]

    function time (fn, loops) {
      const t0 = performance.now()
      for (let i = 0; i < loops; i++) fn(i)
      return performance.now() - t0
    }

    const iconLayoutMs = time(() => {
      for (const el of icons) el.getBoundingClientRect()
    }, 40)

    const allNavLayoutMs = time(() => {
      for (const el of items) el.getBoundingClientRect()
    }, 20)

    const nav = document.querySelector('nav.nav-menu')
    const styleInvalidationMs = time(() => {
      if (!nav) return
      nav.classList.toggle('adt-bench-tone')
      void nav.offsetHeight
    }, 80)

    let scrollPersistMs = 0
    if (menu) {
      scrollPersistMs = time(() => {
        try { sessionStorage.setItem('site-nav-tree:scroll-y', String(menu.scrollTop || 0)) } catch {}
      }, 400)
    }

    const queryIconsMs = time(() => {
      document.querySelectorAll('svg.nav-typology-icon')
    }, 200)

    const flexRowMs = time(() => {
      for (const el of links) {
        const st = getComputedStyle(el)
        void st.display
        void st.gap
        void st.fontSize
      }
    }, 10)

    // Use-element shadow/reference resolve proxy: read href + ownerSVGElement
    const useResolveMs = time(() => {
      for (const el of icons) {
        const u = el.querySelector('use')
        if (u) void (u.href && u.href.baseVal)
        void el.getBBox
      }
    }, 40)

    return {
      iconCount: icons.length,
      itemCount: items.length,
      iconLayoutMs40: +iconLayoutMs.toFixed(3),
      allNavLayoutMs20: +allNavLayoutMs.toFixed(3),
      styleInvalidationMs80: +styleInvalidationMs.toFixed(3),
      scrollPersistMs400: +scrollPersistMs.toFixed(3),
      queryIconsMs200: +queryIconsMs.toFixed(3),
      flexRowMs10: +flexRowMs.toFixed(3),
      useResolveMs40: +useResolveMs.toFixed(3),
      nodes: document.getElementsByTagName('*').length,
    }
  })
}

async function wheelScroll (page, client) {
  const menu = await page.$('.nav-container [data-panel=menu], [data-panel=menu]')
  if (!menu) return { error: 'no-menu' }
  const box = await menu.boundingBox()
  if (!box) return { error: 'no-box' }
  const x = box.x + box.width / 2
  const y = box.y + Math.min(200, box.height / 2)
  await page.evaluate(() => {
    const m = document.querySelector('.nav-container [data-panel=menu], [data-panel=menu]')
    if (m) m.scrollTop = 0
  })
  const t0 = Date.now()
  let frames = 0
  while (Date.now() - t0 < 1500) {
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel', x, y, deltaX: 0, deltaY: 140,
    })
    frames++
    await new Promise((r) => setTimeout(r, 16))
  }
  for (let i = 0; i < frames; i++) {
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel', x, y, deltaX: 0, deltaY: -140,
    })
    if (i % 4 === 0) await new Promise((r) => setTimeout(r, 8))
  }
  return { wheelEvents: frames * 2 }
}

async function runVariant (browser, { label, url, variant }) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  } catch {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  }
  await new Promise((r) => setTimeout(r, 350))
  await applyVariant(page, variant)
  await new Promise((r) => setTimeout(r, 100))

  const micro = await costMicrobench(page)

  let trace = null
  let wheel = null
  try {
    trace = await withTrace(page, async (client) => {
      wheel = await wheelScroll(page, client)
    })
  } catch (e) {
    trace = { error: String(e) }
  }

  const client = await page.createCDPSession()
  await client.send('Performance.enable')
  const metrics = await client.send('Performance.getMetrics')
  const metricMap = Object.fromEntries(metrics.metrics.map((m) => [m.name, m.value]))

  await page.close()
  return {
    label, url, variant, micro, wheel, trace,
    metrics: {
      Nodes: metricMap.Nodes,
      JSEventListeners: metricMap.JSEventListeners,
      JSHeapUsedSize: metricMap.JSHeapUsedSize,
      LayoutCount: metricMap.LayoutCount,
      RecalcStyleCount: metricMap.RecalcStyleCount,
      LayoutDurationMs: +(metricMap.LayoutDuration * 1000).toFixed(3),
      RecalcStyleDurationMs: +(metricMap.RecalcStyleDuration * 1000).toFixed(3),
      ScriptDurationMs: +(metricMap.ScriptDuration * 1000).toFixed(3),
      TaskDurationMs: +(metricMap.TaskDuration * 1000).toFixed(3),
    },
  }
}

async function main () {
  fs.mkdirSync(OUT, { recursive: true })
  const { server, base } = await startStaticServer(SITE)
  const local = `${base}/tools/agent-rules/`
  const hci = 'https://hci-nerdz.github.io/docs/hci-nerdz/index.html'
  const live = 'https://docs.devcentr.org/tools/agent-rules/'

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: existsSync(CHROME) ? CHROME : undefined,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  })

  const jobs = [
    { label: 'cost-A-icons', url: local, variant: 'A' },
    { label: 'cost-B-remove-svg', url: local, variant: 'B-remove-svg' },
    { label: 'cost-C-hide-svg', url: local, variant: 'C-hide-svg' },
    { label: 'cost-D-no-scroll-persist', url: local, variant: 'D-no-scroll-persist' },
    { label: 'cost-E-expand-all', url: local, variant: 'E-expand-all' },
    { label: 'cost-E-expand-all-no-svg', url: local, variant: 'E-expand-all-no-svg' },
    { label: 'cost-F-overflow-x', url: local, variant: 'F-overflow-x' },
    { label: 'cost-live-A', url: live, variant: 'A' },
    { label: 'cost-hci', url: hci, variant: 'A' },
  ]

  const results = []
  for (const job of jobs) {
    process.stdout.write(`Cost ${job.label}...\n`)
    try {
      const r = await runVariant(browser, job)
      results.push(r)
      const m = r.micro
      const paint = r.trace?.selected?.Paint?.ms || 0
      const layout = r.trace?.selected?.Layout?.ms || 0
      const upd = r.trace?.selected?.UpdateLayoutTree?.ms || 0
      process.stdout.write(
        `  icons=${m.iconCount} iconLay=${m.iconLayoutMs40} navLay=${m.allNavLayoutMs20} ` +
        `style=${m.styleInvalidationMs80} persist=${m.scrollPersistMs400} use=${m.useResolveMs40} ` +
        `traceP=${paint} L=${layout} U=${upd} ev=${r.trace?.eventCount}\n`
      )
    } catch (e) {
      results.push({ label: job.label, error: String(e) })
      process.stdout.write(`  ERROR ${e}\n`)
    }
  }

  await browser.close()
  server.close()
  const outPath = path.join(OUT, 'cost-results.json')
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2))

  // compact markdown
  const lines = [
    '| variant | icons | iconLayout×40 | navLayout×20 | styleInv×80 | persist×400 | useResolve×40 | Paint ms | Layout ms | UpdateLayoutTree ms | Nodes |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ]
  for (const r of results) {
    if (r.error) { lines.push(`| ${r.label} | ERROR | | | | | | | | | |`); continue }
    const m = r.micro
    const s = r.trace?.selected || {}
    lines.push(
      `| ${r.label} | ${m.iconCount} | ${m.iconLayoutMs40} | ${m.allNavLayoutMs20} | ${m.styleInvalidationMs80} | ${m.scrollPersistMs400} | ${m.useResolveMs40} | ${s.Paint?.ms ?? 0} | ${s.Layout?.ms ?? 0} | ${s.UpdateLayoutTree?.ms ?? 0} | ${r.metrics.Nodes} |`
    )
  }
  fs.writeFileSync(path.join(OUT, 'cost-results.md'), lines.join('\n'))
  process.stdout.write(`Wrote ${outPath}\n`)
}

main().catch((e) => { console.error(e); process.exit(1) })
