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

/*
  pm2 SIGKILLs this process on a slow shutdown, which orphans the spawned relay compiler
  (SIGKILL can't be trapped, so the cleanup handler below never runs). Orphans keep watching
  and race the live compiler to rewrite __generated__ with docIds from their stale schema.
  Sweep them before spawning. Matches `relay --watch` so the IDE's `relay lsp` is left alone
*/
const killStaleCompilers = () => {
  let pids = []
  try {
    // execFileSync avoids a shell, so no `sh -c` process matches our own pattern
    pids = cp
      .execFileSync('pgrep', ['-f', 'relay --watch'], {encoding: 'utf8'})
      .split('\n')
      .map((pid) => Number(pid.trim()))
      .filter((pid) => pid && pid !== process.pid)
  } catch {
    // pgrep exits 1 when nothing matches
    return
  }
  pids.forEach((pid) => {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // already gone
    }
  })
  if (pids.length > 0) {
    console.log(`Killed ${pids.length} stale relay compiler(s): ${pids.join(', ')}`)
  }
}

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
  killStaleCompilers()
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
