'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const theme = require('../theme')
test('shared DevCentr theme publishes one asset with accessible accent and focus rules', () => {
 let handler
 theme.register.call({ on (event, fn) { assert.equal(event, 'uiLoaded'); handler = fn } })
 const files = []
 handler({ uiCatalog: { addFile: f => files.push(f) } })
 assert.equal(files.length, 1)
 assert.equal(files[0].out.path, '_/css/devcentr-brand.css')
 const css = files[0].contents.toString()
 assert.match(css, /--valentus-accent: #127266/)
 assert.match(css, /color: #69707b/)
 assert.match(css, /#search-input:focus/)
 assert.match(css, /mask-image: none !important/)
 assert.doesNotMatch(css, /#178f80/i)
})

test('theme asset follows Antora custom UI output directories', () => {
 let handler, file
 theme.register.call({ on: (event, fn) => { handler = fn } })
 handler({playbook:{ui:{outputDir:'assets'}},uiCatalog:{addFile:f => {file=f}}})
 assert.equal(file.out.path,'assets/css/devcentr-brand.css')
})
