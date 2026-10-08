/*
  Runs the development stack as 1 foreground process, so stopping it (ctrl+c or SIGTERM) stops everything
  - the server & client bundles are built in this process. A server rebuild restarts the server right away
  - PORT & SOCKET_PORT move up when another checkout already uses them, so every git worktree can run its own stack
  - dev/stack.json says where the stack is served & whether it is ready (see `pnpm dev:status`)
  - every task logs to its own file in dev/logs
  Set DEV_RUN_ONLY to a comma-separated list of task names to run a subset
*/
// must stay first: it loads .env & caps the build threads before rspack is imported
import './devStack/devEnv.mts'
import {rspack, type Stats, type Watching} from '@rspack/core'
import {RspackDevServer} from '@rspack/dev-server'
import {execFileSync} from 'child_process'
import fs from 'fs'
import {createRequire} from 'module'
import path from 'path'
import ChildTask from './devStack/ChildTask.mts'
import claimPorts from './devStack/claimPorts.mts'
import hasPendingMigrations from './devStack/hasPendingMigrations.mts'
import isolateStack from './devStack/isolateStack.mts'
import RelayDevServer from './devStack/RelayDevServer.mts'
import {type DevStack, STACK_PATH} from './devStack/readStack.mts'
import TaskLog from './devStack/TaskLog.mts'
import getProjectRoot from './webpack/utils/getProjectRoot.js'

const require = createRequire(import.meta.url)
const PROJECT_ROOT = getProjectRoot()
const DEV_ROOT = path.join(PROJECT_ROOT, 'dev')
const LOG_ROOT = path.join(DEV_ROOT, 'logs')
const WORKER_MANIFEST_PATH = path.join(PROJECT_ROOT, 'build', 'workerManifest.js')
const MATTERMOST_TASK = 'Mattermost Plugin Dev Server'
// The same as `pnpm pg:generate`, except the database comes from the environment so it also works for an isolated stack
const KYSELY_CODEGEN =
  './node_modules/.bin/kysely-codegen --out-file ./packages/server/postgres/types/pg.d.ts --dialect postgres --url "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB" && ./node_modules/.bin/biome check --write ./packages/server/postgres/types/pg.d.ts'

const flags = process.argv.slice(2)
const isIsolated = flags.includes('--isolated') || process.env.DEV_ISOLATED === 'true'
const runOnly = (process.env.DEV_RUN_ONLY || '')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean)
const isSelected = (name: string) => {
  if (runOnly.length > 0) return runOnly.includes(name)
  return flags.includes('--mattermost') || name !== MATTERMOST_TASK
}

const startedAt = Date.now()
const logs: Record<string, TaskLog> = {}
const children: Record<string, ChildTask> = {}
const state = {
  portOffset: 0,
  readyAfterMs: 0,
  isServerReady: false,
  isClientReady: false,
  hasMigrated: false
}
let relayDevServer: RelayDevServer | undefined
let devServer: RspackDevServer | undefined
let serverWatching: Watching | undefined
let isStopping = false

const getLog = (name: string) => {
  logs[name] ||= new TaskLog(name, LOG_ROOT)
  return logs[name]
}

const writeStack = () => {
  const {PROTO, HOST, PORT, SOCKET_PORT, POSTGRES_DB} = process.env
  const stack: DevStack = {
    pid: process.pid,
    url: `${PROTO}://${HOST}:${PORT}`,
    port: Number(PORT),
    socketPort: Number(SOCKET_PORT),
    database: POSTGRES_DB,
    isolated: isIsolated,
    ready: state.readyAfterMs > 0,
    readyAfterMs: state.readyAfterMs || null,
    startedAt: new Date(startedAt).toISOString(),
    logs: LOG_ROOT,
    childPids: Object.values(children)
      .map((child) => child.pid)
      .concat(relayDevServer?.compilerPid)
      .filter((pid) => pid !== undefined)
  }
  fs.writeFileSync(STACK_PATH, JSON.stringify(stack, null, 2))
}

const isAlive = (pid: number) => {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

// A stack that was SIGKILLed could not stop its children. They are recognized by the path of this checkout
const stopPreviousStack = async () => {
  let previous: DevStack
  try {
    previous = JSON.parse(fs.readFileSync(STACK_PATH, 'utf8'))
  } catch {
    return
  }
  if (isAlive(previous.pid)) {
    console.error(`This checkout is already being served at ${previous.url} (pid ${previous.pid})`)
    process.exit(1)
  }
  // a pid may have been reused by an unrelated process since, so only what runs out of this checkout is stopped
  const leftovers = (previous.childPids ?? []).filter(isAlive).filter((pid) => {
    try {
      const cwd = execFileSync('lsof', ['-a', '-d', 'cwd', '-Fn', '-p', String(pid)], {
        encoding: 'utf8'
      })
      return cwd.includes(`n${PROJECT_ROOT}`)
    } catch {
      return false
    }
  })
  if (leftovers.length === 0) return
  console.log(`Stopping ${leftovers.length} processes that the previous run left behind`)
  leftovers.forEach((pid) => {
    // every child leads its own process group
    process.kill(-pid, 'SIGKILL')
  })
  // their ports must be free again before this run looks for ports
  while (leftovers.some(isAlive)) {
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
}

const runOnce = (name: string, command: string, args: string[], isForced = false) => {
  if (!isForced && !isSelected(name)) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const log = getLog(name)
    const child = new ChildTask({
      command,
      args,
      cwd: PROJECT_ROOT,
      log,
      onExit: (code) => {
        delete children[name]
        if (code) log.line(`Exited with code ${code}`)
        resolve()
      }
    })
    children[name] = child
    child.start()
  })
}

const runForever = (name: string, command: string, args: string[], cwd = PROJECT_ROOT) => {
  if (!isSelected(name)) return
  const child = new ChildTask({command, args, cwd, log: getLog(name)})
  children[name] = child
  child.start().then(writeStack)
}

const markReady = () => {
  if (state.readyAfterMs) return
  if (isSelected('Socket Server') && !state.isServerReady) return
  if (isSelected('Dev Server') && !state.isClientReady) return
  state.readyAfterMs = Date.now() - startedAt
  const {PROTO, HOST, PORT} = process.env
  console.log(
    `\n✅ Ready in ${(state.readyAfterMs / 1000).toFixed(1)}s: ${PROTO}://${HOST}:${PORT}\n`
  )
  startBackgroundTasks()
}

const getBuildMs = (stats: Stats) => (stats.endTime ?? 0) - (stats.startTime ?? 0)

const printProblems = (log: TaskLog, stats: Stats) => {
  if (!stats.hasErrors() && !stats.hasWarnings()) return
  log.write(`${stats.toString({preset: 'errors-warnings', colors: process.stdout.isTTY})}\n`)
}

// The monaco workers only change when monaco is upgraded, so they are built once & reused
const buildWebWorkers = async () => {
  if (fs.existsSync(WORKER_MANIFEST_PATH)) {
    const manifest: Record<string, string[]> = require(WORKER_MANIFEST_PATH)
    const workerFiles = Object.values(manifest).flat()
    const hasWorkers = workerFiles.every((name) =>
      fs.existsSync(path.join(PROJECT_ROOT, 'build', name))
    )
    if (hasWorkers) return
  }
  const log = getLog('Webpack Servers')
  const {default: webWorkersConfig} = await import('./webpack/dev.webworkers.config.mts')
  await new Promise<void>((resolve) => {
    rspack(webWorkersConfig).run((error, stats) => {
      if (stats) printProblems(log, stats)
      else log.line(String(error))
      resolve()
    })
  })
}

const startServerProcess = (
  name: string,
  bundle: string,
  serverId: number,
  onLine?: (line: string) => void
) => {
  if (!isSelected(name)) return
  const log = getLog(name)
  if (onLine) log.onLine(onLine)
  children[name] = new ChildTask({
    command: process.execPath,
    args: ['--enable-source-maps', path.join(DEV_ROOT, bundle)],
    env: {
      // 2 stacks that share a database must not share a server id, because it is part of every id they generate
      SERVER_ID: String(state.portOffset + serverId),
      NODE_COMPILE_CACHE: path.join(PROJECT_ROOT, 'node_modules', '.cache', 'node-compile-cache')
    },
    cwd: PROJECT_ROOT,
    log,
    // On SIGTERM the server spreads its disconnects over a minute so that clients move to the other servers
    // There are no other servers in development, so it only gets the time that an idle server needs to exit
    killAfterMs: 300,
    onExit: (code) => {
      if (code && !isStopping)
        log.line(`Exited with code ${code}. It starts again on the next rebuild`)
    }
  })
}

// The bundles are built in this process, so a server restarts the moment its bundle is written
// The configs are imported late, because they read the ports that this stack ends up with
const watchServers = async (canStartServers: Promise<unknown>) => {
  const log = getLog('Webpack Servers')
  const chunkHashes: Record<string, string | undefined> = {}
  const servers: Record<string, string> = {web: 'Socket Server', embedder: 'Embedder'}
  const {default: serversConfig} = await import('./webpack/dev.servers.config.mts')
  await new Promise<void>((resolve) => {
    serverWatching = rspack(serversConfig).watch({aggregateTimeout: 20}, async (error, stats) => {
      if (!stats) {
        log.line(String(error))
        return
      }
      printProblems(log, stats)
      resolve()
      if (stats.hasErrors()) return
      const {chunks = []} = stats.toJson({all: false, chunks: true})
      await canStartServers
      chunks.forEach(({names = [], hash}) => {
        const [chunkName = ''] = names
        const server = children[servers[chunkName] ?? '']
        const previousHash = chunkHashes[chunkName]
        chunkHashes[chunkName] = hash
        if (!server || previousHash === hash) return
        if (previousHash) log.line(`Rebuilt ${chunkName}.js in ${getBuildMs(stats)}ms`)
        if (chunkName === 'web') state.isServerReady = false
        server.restart().then(writeStack)
      })
    })
  })
}

const startDevServer = async () => {
  const log = getLog('Dev Server')
  const {default: clientConfig, devServer: devServerOptions} = await import(
    './webpack/dev.client.config.mts'
  )
  const clientCompiler = rspack(clientConfig)
  clientCompiler.hooks.done.tap('dev', (stats) => {
    printProblems(log, stats)
    if (state.isClientReady) return
    state.isClientReady = true
    log.line(`Compiled in ${getBuildMs(stats)}ms`)
    markReady()
  })
  devServer = new RspackDevServer(
    {...devServerOptions, devMiddleware: {...devServerOptions.devMiddleware, stats: false}},
    clientCompiler
  )
  await devServer.start()
}

const migrate = async () => {
  const name = 'PG Migrations'
  if (!isIsolated && !isSelected(name)) return
  if (await hasPendingMigrations(PROJECT_ROOT)) {
    state.hasMigrated = true
    await runOnce(name, 'pnpm', ['kysely', 'migrate:latest'], true)
  } else {
    getLog(name).line('The database is up to date')
  }
}

const stop = async () => {
  if (isStopping) return
  isStopping = true
  console.log('\nStopping the dev stack')
  fs.rmSync(STACK_PATH, {force: true})
  await Promise.allSettled([
    ...Object.values(children).map((child) => child.stop()),
    relayDevServer?.stop(),
    devServer?.stop(),
    new Promise<void>((resolve) => (serverWatching ? serverWatching.close(resolve) : resolve()))
  ])
  process.exit(0)
}

const dev = async () => {
  fs.mkdirSync(LOG_ROOT, {recursive: true})
  await stopPreviousStack()
  const {port, socketPort, offset} = await claimPorts()
  if (offset > 0) console.log(`Port ${process.env.PORT} is taken, so this stack uses ${port}`)
  state.portOffset = offset
  process.env.PORT = String(port)
  process.env.SOCKET_PORT = String(socketPort)
  if (isIsolated) await isolateStack(PROJECT_ROOT, offset)
  writeStack()

  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
  process.on('exit', () => {
    Object.values(children).forEach((child) => child.killNow())
    relayDevServer?.killNow()
  })

  // an isolated stack starts from an empty database & shares its valkey server, so these are not optional for it
  const flush = runOnce('Flush Valkey', process.execPath, ['scripts/flushValkey.mts'], isIsolated)
  const migrations = migrate()

  if (isSelected('Relay Compiler')) {
    relayDevServer = new RelayDevServer({log: getLog('Relay Compiler')})
    await relayDevServer.start()
    writeStack()
  }

  startServerProcess('Socket Server', 'web.js', 0, (line) => {
    if (!line.includes('Ready for Sockets')) return
    state.isServerReady = true
    markReady()
  })
  const canStartServers = Promise.all([flush, migrations])
  // The server takes the longest to be ready, so its bundle is built before anything else competes for the CPU
  if (isSelected('Webpack Servers')) {
    await watchServers(canStartServers)
  } else {
    canStartServers.then(() => children['Socket Server']?.start())
  }
  if (isSelected('Dev Server')) {
    // the client imports the manifest of the web workers
    if (isSelected('Webpack Servers')) await buildWebWorkers()
    await startDevServer()
  }
  markReady()
}

// Nobody waits for these, so they stay out of the way until the stack is being served
const startBackgroundTasks = () => {
  const generateDatabaseTypes = () => runOnce('Kysely Codegen', 'bash', ['-c', KYSELY_CODEGEN])
  const typesGenerated = generateDatabaseTypes()
  let isEmbedderReady = false
  startServerProcess('Embedder', 'embedder.js', 6, (line) => {
    if (isEmbedderReady || !line.includes('Embedder is ready')) return
    isEmbedderReady = true
    // On a new database the embedder creates its tables after the types were generated, so they are generated again
    if (state.hasMigrated) typesGenerated.then(generateDatabaseTypes)
  })
  children.Embedder?.start().then(writeStack)
  runForever('GraphQL Codegen', process.execPath, ['scripts/codegenGraphQL.js', '--watch'])
  // its queries are part of the same relay project as the client, so the Relay Compiler task already compiles them
  runForever(
    MATTERMOST_TASK,
    process.execPath,
    ['./scripts/hmrServer.js'],
    path.join(PROJECT_ROOT, 'packages', 'mattermost-plugin')
  )
  writeStack()
}

dev().catch((error) => {
  console.error(error)
  Object.values(children).forEach((child) => child.killNow())
  relayDevServer?.killNow()
  process.exit(1)
})
