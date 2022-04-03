/*
  Compiles relay fragments into documents and type definitions
  Watches all components and recompiles on change
  If the underlying schema changes, this should be re-run
*/
const compileRelay = async (isWatch) => {
  const relayConfig = require('relay-config')
  const config = relayConfig.loadConfig()
  const safeConfig = JSON.parse(JSON.stringify(config))
  if (isWatch) {
    safeConfig.watch = true
    safeConfig.watchman = true
  }
  const {relayCompiler} = require('relay-compiler')
  await relayCompiler(safeConfig)
}

if (require.main === module) {
  const isWatch = process.argv[2] === '--watch'
  compileRelay(isWatch)
}

module.exports = compileRelay
