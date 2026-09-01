;(function () {
  'use strict'

  function siteNavTreeCurrent () {
    var menu = document.querySelector('.nav-container [data-panel=menu]')
    if (!menu) return

    var currents = [].slice.call(menu.querySelectorAll('.nav-item.is-current-page'))
    if (!currents.length) return

    currents.sort(function (a, b) {
      return (parseInt(b.getAttribute('data-depth'), 10) || 0) - (parseInt(a.getAttribute('data-depth'), 10) || 0)
    })
    var best = currents[0]

    currents.forEach(function (el) {
      if (el !== best) el.classList.remove('is-current-page')
    })

    menu.querySelectorAll('.nav-item.is-active, .nav-item.is-current-path').forEach(function (el) {
      el.classList.remove('is-active', 'is-current-path')
    })

    var node = best
    while (node && !(node.classList && node.classList.contains('nav-menu'))) {
      if (node.tagName === 'LI' && node.classList.contains('nav-item')) {
        node.classList.add('is-active', 'is-current-path')
      }
      node = node.parentNode
    }
    best.classList.add('is-active', 'is-current-page')

    var componentRoot = best
    while (componentRoot) {
      var depth = parseInt(componentRoot.getAttribute('data-depth'), 10)
      if (depth === 0) break
      componentRoot = componentRoot.parentElement
        ? componentRoot.parentElement.closest('li.nav-item')
        : null
    }
    if (!componentRoot) return

    var branchLists = componentRoot.querySelectorAll(':scope > .nav-list > .nav-item')
    branchLists.forEach(function (branch) {
      branch.classList.add('is-active', 'is-current-path')
    })
  }

  window.siteNavTreeCurrent = siteNavTreeCurrent
  siteNavTreeCurrent()
})()
