const path = require('path')
const {writeFileSync} = require('node:fs')
const getProjectRoot = require('./getProjectRoot')

const PROJECT_ROOT = getProjectRoot()

class WriteWorkerAssets {
  apply(compiler) {
    compiler.hooks.done.tap('WriteWorkerAssets', (stats) => {
      const assets = stats.toJson({assets: true}).assetsByChunkName
      writeFileSync(
        path.resolve(PROJECT_ROOT, 'build', 'workerManifest.js'),
        `module.exports = ${JSON.stringify(assets)}`
      )
    })
  }
}

module.exports = WriteWorkerAssets
