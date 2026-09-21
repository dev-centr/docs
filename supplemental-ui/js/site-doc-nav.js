/**
 * In-doc navigation: crossfade article pane, preserve viewport scroll.
 * Intercepts same-origin content links inside the main column only.
 *
 * Also swaps the doc mast (component/version kickers + breadcrumb trail).
 * Without that, soft nav leaves a stale path from the previous page.
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

  function sameSite (url) {
    try {
      var u = new URL(url, window.location.href)
      return u.origin === window.location.origin && u.pathname !== window.location.pathname
    } catch (e) {
      return false
    }
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
   * Re-bind mast kickers after innerHTML swap. Mirrors Valentus
   * site-adt-accordion.js but only for newly inserted toggles (data-adt-bound).
   * Document-level outside-click close from the original init still applies.
   */
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

  function swapMast (freshMast) {
    if (!freshMast) return
    var host =
      document.querySelector('.adt-doc-mast-center') || document.querySelector('nav.breadcrumbs')
    if (!host) return
    host.innerHTML = freshMast.innerHTML
    bindBreadcrumbDropdowns(host)
  }

  function swapNav (freshNav) {
    if (!freshNav) return
    var panel = document.querySelector('.nav-container [data-panel=menu]')
    if (!panel) return
    panel.innerHTML = freshNav.innerHTML
    runNavFixups()
  }

  function swapArticle (freshArticle, doc, url, push) {
    if (!freshArticle) {
      window.location.href = url
      return
    }
    var scrollY = window.scrollY
    articleHost.style.transition = 'opacity ' + FADE_MS + 'ms ease'
    articleHost.style.opacity = '0'
    window.setTimeout(function () {
      articleHost.innerHTML = freshArticle.innerHTML
      if (push) history.pushState({ docNav: true }, '', url)
      document.title = extractTitle(doc)
      articleHost.style.opacity = '1'
      window.scrollTo(0, scrollY)
      window.setTimeout(function () {
        articleHost.style.transition = ''
      }, FADE_MS)
      document.dispatchEvent(new CustomEvent('doc-nav:loaded'))
    }, FADE_MS)
  }

  function navigate (url, push) {
    fetch(url, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('fetch failed')
        return res.text()
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html')
        swapMast(extractMast(doc))
        swapNav(extractNav(doc))
        swapArticle(extractArticle(doc), doc, url, push)
      })
      .catch(function () {
        window.location.href = url
      })
  }

  root.addEventListener('click', function (ev) {
    var a = ev.target.closest('a')
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return
    if (a.closest('.nav-container')) return
    var href = a.getAttribute('href')
    if (!href || href.charAt(0) === '#') return
    if (!sameSite(a.href)) return
    ev.preventDefault()
    navigate(a.href, true)
  })

  window.addEventListener('popstate', function () {
    // Initial /home/ entry often has null state; still must swap article content.
    navigate(window.location.href, false)
  })

  // Stamp the landing page so a later Back to it is distinguishable and reloadable.
  if (!history.state || !history.state.docNav) {
    history.replaceState({ docNav: true }, '', window.location.href)
  }
})()