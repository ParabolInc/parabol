const path = require('path')
const getProjectRoot = require('./getProjectRoot')

const CACHE_DIRECTORY = path.join(getProjectRoot(), '.webpackCache')

// CI restores this between runs. A fresh checkout gives every file a new mtime, so modules are compared by content hash
const persistentCache = (name, configFile) => {
  if (process.env.WEBPACK_PERSISTENT_CACHE !== 'true') return {}
  return {
    cache: {
      type: 'filesystem',
      name,
      cacheDirectory: CACHE_DIRECTORY,
      buildDependencies: {config: [configFile]}
    },
    snapshot: {
      module: {timestamp: true, hash: true},
      resolve: {timestamp: true, hash: true}
    }
  }
}

module.exports = persistentCache
