/**
 * In-doc navigation: crossfade article pane, preserve viewport scroll.
 * Intercepts same-origin content links inside the main column only.
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

  function runNavFixups () {
    if (typeof window.siteNavTreeCurrent === 'function') {
      window.siteNavTreeCurrent()
    }
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

  window.addEventListener('popstate', function (ev) {
    if (!ev.state || !ev.state.docNav) return
    navigate(window.location.href, false)
  })
})()
