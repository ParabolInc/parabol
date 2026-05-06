/*
  Compiles relay fragments into documents and type definitions
  Watches all components and recompiles on change
  If the underlying schema changes, this should be re-run
*/
require('sucrase/register')
const cp = require('child_process')
const path = require('path')
const relayCompilerPath = require('relay-compiler')
const RelayPersistServer = require('./RelayPersistServer').default
const runSchemaUpdater = require('./runSchemaUpdater').default
const waitForFileExists = require('./waitForFileExists').default

const relayWatch = async () => {
  const schemaPath = path.join(__dirname, '../packages/server/graphql/public/schema.graphql')
  const schemaExists = await waitForFileExists(schemaPath, 20000)
  // quiet errors expected on first run (SSR components importing .graphql fragments that do not exist yet)
  const schemaUpdater = runSchemaUpdater(!schemaExists)
  // don't wait if a schema exists. startup fast with a stale schema
  if (!schemaExists) await schemaUpdater
  const persistServer = new RelayPersistServer()
  await persistServer.ready.catch(() => {
    console.error(
      `Port 2999 is already in use. A previous relay watch process may still be running. Kill it and retry.`
    )
    process.exit(1)
  })
  const compiler = cp
    .spawn(relayCompilerPath, ['--watch'], {
      stdio: ['inherit', 'pipe', 'inherit']
    })
    // if relay compiler gets killed, kill this process
    .on('exit', process.exit)
  const cleanup = () => {
    persistServer.close()
    compiler.kill()
    process.exit()
  }
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  await new Promise((resolve) => {
    compiler.stdout.on('data', (data) => {
      // pipe relay messages to the parent process. We can finetune this to keep it quiet
      process.stdout.write(data)
      if (!data.toString().includes('Compilation completed.')) return
      // Relay has finished compiling
      resolve(true)
    })
  })
}

relayWatch()
