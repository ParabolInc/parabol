// Calling this while the cwd is in dev is MUCH slower than calling it at the root dir.
// Penalty goes away when debugging.
const path = require('path')
const { fork } = require('child_process')
const fs = require('fs')

const compileServers = () => {
  return new Promise((resolve) => {
    const config = require('./dev.servers.config')
    const webpack = require('webpack')
    const compiler = webpack(config)
    compiler.watch(true, () => {
      resolve()
    })
  })
}

const schemaPath = path.join(__dirname, '../../schema.graphql')

const watchGraphQLSchema = () => {
  const watchRelayPath = path.join(__dirname, 'watchRelay.js')
  let relayWatchFork = fork(watchRelayPath)
  let throttleId
  fs.watch(schemaPath, () => {
    clearTimeout(throttleId)
    throttleId = setTimeout(() => {
      throttleId = undefined
      relayWatchFork.kill('SIGINT')
      relayWatchFork = fork(watchRelayPath)
    }, 3000)
  })
}

const dev = async () => {
  const buildClientDLL = require('./buildDll')
  await Promise.all([compileServers(), buildClientDLL()])
  const updateSchema = require('../../dev/updateSchema.js').default
  await updateSchema()
  fork(path.join(__dirname, '../../dev/gqlExecutor.js'))
  require('../../dev/web.js')
  // the __generated__ files have to wait for the server to create the schema
  await new Promise((res) => setTimeout(res, 3000))
  watchGraphQLSchema()
}
dev()
