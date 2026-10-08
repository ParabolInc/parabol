require('sucrase/register')
const relayCompilerPath = require('relay-compiler')
const cp = require('child_process')
const path = require('path')
const process = require('process')
const runSchemaUpdater = require('./runSchemaUpdater').default
const RelayPersistServer = require('./RelayPersistServer').default
const {Logger} = require('../packages/server/utils/Logger')

const killOnExit = (child) => {
  process.on('exit', () => {
    child.kill()
  })
}

const compileRelay = async () => {
  const persistServer = new RelayPersistServer()
  const serverStarted = await persistServer.ready
    .then(() => true)
    .catch((err) => {
      if (err.code !== 'EADDRINUSE') throw err
      return false
    })
  await new Promise((resolve) => {
    // a build changes thousands of files, and watchman makes relay wait seconds until it has seen them all
    // walking the directory is faster for a single compile
    const env = {...process.env, FORCE_NO_WATCHMAN: '1'}
    const relayCompiler = cp.exec(relayCompilerPath, {cwd: process.cwd(), env}).on('exit', resolve)
    killOnExit(relayCompiler)
    relayCompiler.stderr.pipe(process.stderr)
  })
  Logger.log('relay compiler client complete')
  if (serverStarted) persistServer.close()
}

// codegen is synchronous for seconds at a time, which would starve the persist server if it shared this process
const runCodegen = () =>
  new Promise((resolve, reject) => {
    const codegen = cp.fork(path.join(__dirname, 'codegenGraphQL.js')).on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`GraphQL codegen exited with code ${code}`))
        return
      }
      Logger.log('codegen complete')
      resolve()
    })
    killOnExit(codegen)
  })

// webpack bundles the relay artifacts, but only tsc reads the codegen types
// They are returned separately so a build can start bundling without waiting for the types
const generateGraphQLArtifacts = () => {
  const schema = runSchemaUpdater(true)
  return {
    relay: schema.then(compileRelay),
    types: schema.then(runCodegen)
  }
}

if (require.main === module) {
  generateGraphQLArtifacts()
}

module.exports = generateGraphQLArtifacts
