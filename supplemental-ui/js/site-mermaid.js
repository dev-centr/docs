/**
 * Render AsciiDoc Mermaid blocks in Antora pages.
 * Supports [source,mermaid] (code.language-mermaid) and bare [mermaid] listingblocks.
 */
;(function () {
  const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'

  function isDark() {
    return document.documentElement.classList.contains('dark-theme')
  }

  function looksLikeMermaid(text) {
    const t = String(text || '').trim()
    return /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|C4Context|C4Container)\b/.test(
      t,
    )
  }

  function collectTargets() {
    const nodes = []
    const seen = new Set()
    function add(block, text) {
      if (!block || seen.has(block)) return
      seen.add(block)
      nodes.push({ block, text })
    }
    document.querySelectorAll('code.language-mermaid, code[data-lang="mermaid"]').forEach((code) => {
      add(code.closest('.listingblock') || code.parentElement, code.textContent || '')
    })
    // Hybrid: Kroki ignores [source,text]; keep Mermaid source for client render.
    document.querySelectorAll('.listingblock.mermaid-client, .listingblock.adt-mermaid-client').forEach((block) => {
      const pre = block.querySelector('pre')
      add(block, (pre && pre.textContent) || block.textContent || '')
    })
    document.querySelectorAll('pre.mermaid, .mermaid-source').forEach((pre) => {
      if (pre.closest('.adt-mermaid')) return
      add(pre.closest('.listingblock') || pre, pre.textContent || '')
    })
    document.querySelectorAll('.listingblock > .content > pre').forEach((pre) => {
      if (pre.querySelector('code.language-mermaid, code[data-lang="mermaid"]')) return
      const text = pre.textContent || ''
      if (!looksLikeMermaid(text)) return
      add(pre.closest('.listingblock'), text)
    })
    return nodes
  }

  function mountDiagram(block, text, index) {
    const host = document.createElement('div')
    host.className = 'mermaid adt-mermaid'
    host.setAttribute('data-mermaid-index', String(index))
    host.textContent = text.trim()
    block.replaceWith(host)
    return host
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.mermaid) {
        resolve(window.mermaid)
        return
      }
      const existing = document.querySelector('script[data-adt-mermaid]')
      if (existing) {
        existing.addEventListener('load', () => resolve(window.mermaid))
        existing.addEventListener('error', reject)
        return
      }
      const s = document.createElement('script')
      s.src = src
      s.async = true
      s.dataset.adtMermaid = '1'
      s.onload = () => resolve(window.mermaid)
      s.onerror = reject
      document.head.appendChild(s)
    })
  }

  async function renderAll() {
    const targets = collectTargets()
    if (!targets.length) return

    const mermaid = await loadScript(MERMAID_CDN)
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: isDark() ? 'dark' : 'default',
      flowchart: { htmlLabels: true, curve: 'basis' },
    })

    const hosts = targets.map((t, i) => mountDiagram(t.block, t.text, i))
    await mermaid.run({ nodes: hosts })
  }

  function boot() {
    renderAll().catch((err) => console.warn('[adt-mermaid]', err))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }

  // Re-theme after dark-mode toggle (pages with diagrams already rendered keep SVG; reload is fine).
  const obs = new MutationObserver(() => {
    /* theme switch mid-session: leave rendered SVG; next navigation picks theme */
  })
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  function onSoftNavLoaded (fn) {
    if (window.SoftNav && typeof SoftNav.on === 'function') SoftNav.on('loaded', fn)
    else document.addEventListener('soft-nav:loaded', function (e) { fn(e.detail || {}) })
  }
  onSoftNavLoaded(function () { boot() })
})()
