const webpack = require('webpack')

const buildServers = async () => {
  const config = require('./webpack/dev.servers.config')
  const compiler = webpack(config)
  compiler.watch({aggregateTimeout: 100}, () => {
    /* servers finished rebuilding */
  })
}

buildServers()
