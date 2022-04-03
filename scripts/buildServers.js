/**
 This builds our servers & writes them to {@link ../dev}
 It continues to watch all the files that are part of the build.
 If one of those files changes, the watcher regenerates the output file.
 The pm2 executor & socketServer processes watch for changes to the output files.
 When a change is detected the pm2 process restarts, loading the new code.
*/
const webpack = require('webpack')

const buildServers = async () => {
  const config = require('./webpack/dev.servers.config')
  const compiler = webpack(config)
  compiler.watch({aggregateTimeout: 100}, () => {
    /* servers finished rebuilding */
  })
}

buildServers()
