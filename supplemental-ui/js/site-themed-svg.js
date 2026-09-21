import { upgradeThemedSvgImages } from './vendor/themed-svg-element.js'

function upgradeMarkedDiagrams() {
  document.querySelectorAll('.imageblock.themed-svg img').forEach((image) => {
    image.setAttribute('data-themed-svg', '')
  })
  upgradeThemedSvgImages()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', upgradeMarkedDiagrams, { once: true })
} else {
  upgradeMarkedDiagrams()
}

function onSoftNavLoaded (fn) {
  if (window.SoftNav && typeof SoftNav.on === 'function') SoftNav.on('loaded', fn)
  else document.addEventListener('soft-nav:loaded', function (e) { fn(e.detail || {}) })
}
onSoftNavLoaded(function () { upgradeMarkedDiagrams() })
