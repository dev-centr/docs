/**
 * In-doc navigation: crossfade article pane, preserve viewport scroll.
 * Intercepts same-origin content links inside the main column only.
 *
 * Same Antora component: soft-swap article, side nav, and doc mast
 * (kickers + breadcrumb trail). Cross-component links do a full load —
 * chrome (nav tree, mast, toolbar) differs enough that partial morphs
 * go stale.
 *
 * pushState runs before DOM swaps so relative hrefs in fetched HTML
 * resolve against the destination URL.
 */
;(function () {
  'use strict'

  var FADE_MS = 180
  var root = document.querySelector('.body')
  var articleHost =
    document.querySelector('main.article .content') ||
    document.querySelector('main.article') ||
    document.querySelector('article.doc')
  if (!root || !articleHost) return

  function pageUrl (url) {
    return new URL(url, window.location.href)
  }

  function sameOrigin (url) {
    try {
      return pageUrl(url).origin === window.location.origin
    } catch (e) {
      return false
    }
  }

  function samePath (url) {
    try {
      return pageUrl(url).pathname === window.location.pathname
    } catch (e) {
      return false
    }
  }

  /** First path segment is the Antora component name in this hub. */
  function componentName (url) {
    try {
      var parts = pageUrl(url).pathname.split('/').filter(Boolean)
      return parts[0] || ''
    } catch (e) {
      return ''
    }
  }

  function sameComponent (url) {
    return componentName(url) === componentName(window.location.href)
  }

  function extractArticle (doc) {
    return (
      doc.querySelector('main.article .content') ||
      doc.querySelector('main.article') ||
      doc.querySelector('article.doc')
    )
  }

  function extractTitle (doc) {
    var t = doc.querySelector('title')
    return t ? t.textContent : document.title
  }

  function extractNav (doc) {
    return doc.querySelector('.nav-container [data-panel=menu]')
  }

  function extractMast (doc) {
    return doc.querySelector('.adt-doc-mast-center') || doc.querySelector('nav.breadcrumbs')
  }

  function runNavFixups () {
    if (typeof window.siteNavTreeCurrent === 'function') {
      window.siteNavTreeCurrent()
    }
  }

  /**
   * Make href/src absolute against the destination page before insert.
   * Fetched HTML uses relatives that would otherwise resolve against the
   * pre-navigation URL if pushState were delayed.
   */
  function absolutize (rootEl, destHref) {
    if (!rootEl) return
    var base = pageUrl(destHref)
    ;['href', 'src'].forEach(function (attr) {
      ;[].forEach.call(rootEl.querySelectorAll('[' + attr + ']'), function (el) {
        var raw = el.getAttribute(attr)
        if (!raw || raw.charAt(0) === '#' || raw.indexOf('mailto:') === 0 || raw.indexOf('javascript:') === 0) {
          return
        }
        try {
          el.setAttribute(attr, new URL(raw, base).href)
        } catch (e) {
          /* leave as-is */
        }
      })
    })
  }

  function bindBreadcrumbDropdowns (scope) {
    if (!scope) return
    ;[].forEach.call(scope.querySelectorAll('.adt-bc-dropdown'), function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation()
      })
    })
    ;[].forEach.call(scope.querySelectorAll('[data-adt-toggle]'), function (button) {
      if (button.getAttribute('data-adt-bound')) return
      button.setAttribute('data-adt-bound', '1')
      var id = button.getAttribute('data-adt-toggle')
      if (!id) return
      var list = document.getElementById(id)
      if (!list) return
      button.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        var isHidden = list.hasAttribute('hidden')
        ;[].forEach.call(document.querySelectorAll('.adt-bc-dropdown'), function (dd) {
          if (dd === list) return
          dd.setAttribute('hidden', 'hidden')
        })
        ;[].forEach.call(document.querySelectorAll('[data-adt-toggle]'), function (b) {
          b.setAttribute('aria-expanded', 'false')
        })
        if (isHidden) {
          list.removeAttribute('hidden')
          button.setAttribute('aria-expanded', 'true')
        } else {
          list.setAttribute('hidden', 'hidden')
          button.setAttribute('aria-expanded', 'false')
        }
      })
    })
  }

  function swapMast (freshMast, destHref) {
    var host = document.querySelector('.adt-doc-mast-center')
    if (!host) host = document.querySelector('nav.breadcrumbs')
    if (!host || !freshMast) return
    var node = document.importNode(freshMast, true)
    absolutize(node, destHref)
    host.replaceWith(node)
    bindBreadcrumbDropdowns(node)
  }

  function swapNav (freshNav, destHref) {
    if (!freshNav) return
    var panel = document.querySelector('.nav-container [data-panel=menu]')
    if (!panel) return
    var node = document.importNode(freshNav, true)
    absolutize(node, destHref)
    panel.innerHTML = ''
    while (node.firstChild) panel.appendChild(node.firstChild)
    runNavFixups()
  }

  function swapArticle (freshArticle, destHref) {
    if (!freshArticle) {
      window.location.href = destHref
      return
    }
    var scrollY = window.scrollY
    var node = document.importNode(freshArticle, true)
    absolutize(node, destHref)
    articleHost.style.transition = 'opacity ' + FADE_MS + 'ms ease'
    articleHost.style.opacity = '0'
    window.setTimeout(function () {
      articleHost.innerHTML = ''
      while (node.firstChild) articleHost.appendChild(node.firstChild)
      articleHost.style.opacity = '1'
      window.scrollTo(0, scrollY)
      window.setTimeout(function () {
        articleHost.style.transition = ''
      }, FADE_MS)
      document.dispatchEvent(new CustomEvent('doc-nav:loaded', { detail: { url: destHref } }))
    }, FADE_MS)
  }

  function navigate (url, push) {
    var dest = pageUrl(url).href
    fetch(dest, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('fetch failed')
        return res.text()
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html')
        var freshMast = extractMast(doc)
        var freshNav = extractNav(doc)
        var freshArticle = extractArticle(doc)
        if (!freshArticle) throw new Error('no article')
        // Destination URL first so injected relative links resolve correctly.
        if (push) history.pushState({ docNav: true }, '', dest)
        document.title = extractTitle(doc)
        swapMast(freshMast, dest)
        swapNav(freshNav, dest)
        swapArticle(freshArticle, dest)
      })
      .catch(function () {
        window.location.href = dest
      })
  }

  root.addEventListener('click', function (ev) {
    var a = ev.target.closest('a')
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return
    if (a.closest('.nav-container')) return
    var href = a.getAttribute('href')
    if (!href || href.charAt(0) === '#') return
    if (!sameOrigin(a.href) || samePath(a.href)) return
    // Different Antora component: let the browser do a full document load.
    if (!sameComponent(a.href)) return
    ev.preventDefault()
    navigate(a.href, true)
  })

  window.addEventListener('popstate', function () {
    navigate(window.location.href, false)
  })

  if (!history.state || !history.state.docNav) {
    history.replaceState({ docNav: true }, '', window.location.href)
  }
})()