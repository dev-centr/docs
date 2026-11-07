'use strict'
const { readFileSync } = require('node:fs')
const path = require('node:path')
exports.register = function () {
  this.on('uiLoaded', ({ playbook, uiCatalog }) => {
    const out = playbook?.ui?.outputDir || '_'
    uiCatalog.addFile({
      path: 'css/devcentr-brand.css',
      type: 'asset',
      contents: readFileSync(path.join(__dirname, 'css/devcentr-brand.css')),
      out: { path: out + '/css/devcentr-brand.css', dirname: out + '/css', basename: 'devcentr-brand.css' },
    })
  })
}
