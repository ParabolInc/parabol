/*
  Compiles relay fragments into documents and type definitions
  Watches all components and recompiles on change
  If the underlying schema changes, this should be re-run
*/
const watchRelay = () => {
  const relayConfig = require('relay-config')
  const config = relayConfig.loadConfig()
  const safeConfig = JSON.parse(JSON.stringify(config))
  safeConfig.watch = true
  safeConfig.watchman = true
  const {relayCompiler} = require('relay-compiler')
  relayCompiler(safeConfig)
}

watchRelay()
