const compileRelay = (isWatch) => {
  const relayConfig = require('relay-config')
  const config = relayConfig.loadConfig()
  if (isWatch) {
    config.watch = true
    config.watchman = true
  }
  const { relayCompiler } = require('relay-compiler')
  relayCompiler(config)
}

if (require.main === module) {
  const isWatch = process.argv[2] !== '-r'
  compileRelay(false)
}

module.exports = compileRelay
