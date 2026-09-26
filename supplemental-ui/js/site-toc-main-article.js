/**
 * Keep the right-rail Contents chrome even when the article has no section
 * headings. Default UI site.js removes aside.toc.sidebar when its heading
 * query is empty; SoftNav also leaves a stale TOC because it only swaps
 * mast/nav/article.
 *
 * Prefer a "Main article" placeholder that jumps to the page title (or article
 * top) so long pages still have a Contents affordance.
 */
;(function () {
  'use strict'

  function ensureTitleId (article) {
    var h1 = article.querySelector('h1.page, h1.adt-page-title, h1')
    if (!h1) return null
    if (!h1.id) h1.id = 'main-article'
    return h1
  }

  function headingSelector (levels) {
    var n = 'article.doc'
    var parts = []
    var i
    for (i = 0; i <= levels; i++) {
      var r = [n]
      if (i) {
        var c
        for (c = 1; c <= i; c++) r.push((c === 2 ? '.sectionbody>' : '') + '.sect' + c)
        r.push('h' + (i + 1) + '[id]' + (i > 1 ? ':not(.discrete)' : ''))
      } else {
        r.push('h1[id].sect0')
      }
      parts.push(r.join('>'))
    }
    return parts.join(',')
  }

  function ensureTocAside () {
    var aside = document.querySelector('aside.toc.sidebar')
    if (aside) return aside
    var body = document.querySelector('.body.adt-body') || document.querySelector('.body')
    if (!body) return null
    aside = document.createElement('aside')
    aside.className = 'toc sidebar'
    aside.setAttribute('data-title', 'Contents')
    aside.setAttribute('data-levels', '2')
    var menu = document.createElement('div')
    menu.className = 'toc-menu'
    aside.appendChild(menu)
    body.appendChild(aside)
    return aside
  }

  function rebuildToc () {
    if (document.body && document.body.classList.contains('-toc')) return
    var article = document.querySelector('article.doc')
    if (!article) return

    var aside = ensureTocAside()
    if (!aside) return

    var levels = parseInt(aside.getAttribute('data-levels') || '2', 10)
    if (isNaN(levels) || levels < 0) levels = 2

    var headings = [].slice.call(article.querySelectorAll(headingSelector(levels)))
    var menu = aside.querySelector('.toc-menu')
    if (!menu) {
      menu = document.createElement('div')
      menu.className = 'toc-menu'
      aside.appendChild(menu)
    }
    menu.innerHTML = ''

    var title = document.createElement('h3')
    title.textContent = aside.getAttribute('data-title') || 'Contents'
    menu.appendChild(title)

    var ul = document.createElement('ul')
    menu.appendChild(ul)

    if (!headings.length) {
      var h1 = ensureTitleId(article)
      var li = document.createElement('li')
      li.dataset.level = '0'
      var a = document.createElement('a')
      a.textContent = 'Main article'
      a.href = h1 ? '#' + h1.id : '#'
      li.appendChild(a)
      ul.appendChild(li)
      return
    }

    headings.forEach(function (h) {
      var li = document.createElement('li')
      li.dataset.level = String(parseInt(h.nodeName.slice(1), 10) - 1)
      var a = document.createElement('a')
      a.textContent = h.textContent
      a.href = '#' + h.id
      li.appendChild(a)
      ul.appendChild(li)
    })
  }

  function onSoftNav (fn) {
    if (window.SoftNav && typeof SoftNav.on === 'function') SoftNav.on('loaded', fn)
    else document.addEventListener('soft-nav:loaded', function (e) { fn(e.detail || {}) })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rebuildToc)
  } else {
    rebuildToc()
  }
  onSoftNav(function () {
    rebuildToc()
  })
})()
