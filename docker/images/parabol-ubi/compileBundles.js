// Runs while the image is built, so NODE_COMPILE_CACHE holds V8's code cache for each bundle a container starts.
// A bundle stops at its first require, so it is compiled without running any of its code
const Module = require('node:module')
const path = require('node:path')

const bundles = ['web.js', 'embedder.js', 'preDeploy.js'].map((name) => path.resolve('dist', name))
const stopBeforeRunning = new Error('Compiled')
const {require: requireModule} = Module.prototype
Module.prototype.require = function (id) {
  if (bundles.includes(this.filename)) throw stopBeforeRunning
  return requireModule.call(this, id)
}

bundles.forEach((bundle) => {
  try {
    require(bundle)
  } catch (error) {
    if (error !== stopBeforeRunning) throw error
  }
})
