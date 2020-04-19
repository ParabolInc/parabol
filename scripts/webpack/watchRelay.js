const watchRelay = () => {
  const relayConfig = require('relay-config')
  const config = relayConfig.loadConfig()
  config.watch = true
  config.watchman = true
  const { relayCompiler } = require('relay-compiler')
  relayCompiler(config)
}

module.exports = watchRelay
