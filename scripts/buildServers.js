/**
 This builds our servers & writes them to {@link ../dev}
 It continues to watch all the files that are part of the build.
 If one of those files changes, the watcher regenerates the output file.
 The pm2 executor & socketServer processes watch for changes to the output files.
 When a change is detected the pm2 process restarts, loading the new code.
*/
require('sucrase/register')
const webpack = require('webpack')
const waitForFileExists = require('./waitForFileExists').default
const path = require('path')

const buildServers = async () => {
  const config = require('./webpack/dev.servers.config')
  const compiler = webpack(config)
  const queryMapExists = await waitForFileExists(path.join(__dirname, '../queryMap.json'), 20000)
  if (!queryMapExists) throw Error('QueryMap Not Available. Run `yarn relay:build`')
  compiler.watch({aggregateTimeout: 100}, (err, stats) => {
    if (err) {
      console.log('Webpack error:', err)
    }
    const errors = stats?.compilation?.errors ?? []
    if (errors.length > 0) {
      console.log('COMPILATION ERRORS:', errors)
    }
    /* servers finished rebuilding */
  })
}

buildServers()
