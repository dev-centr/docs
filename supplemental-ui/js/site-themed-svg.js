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
