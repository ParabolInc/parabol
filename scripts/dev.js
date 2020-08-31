// Calling this while the cwd is in dev is MUCH slower than calling it at the root dir.
// Penalty goes away when debugging.
const path = require('path')
const {fork} = require('child_process')
const fs = require('fs')
const {promisify} = require('util')
const webpack = require('webpack')
const getProjectRoot = require('./webpack/utils/getProjectRoot')
const Redis = require('ioredis')

const rmdir = promisify(fs.rmdir)
const unlink = promisify(fs.unlink)
const PROJECT_ROOT = getProjectRoot()
const TOOLBOX_ROOT = path.join(PROJECT_ROOT, 'scripts', 'toolbox')

const compileToolbox = () => {
  return new Promise((resolve) => {
    const config = require('./webpack/toolbox.config')
    const compiler = webpack(config)
    compiler.run(resolve)
  })
}

const compileServers = () => {
  return new Promise((resolve) => {
    const config = require('./webpack/dev.servers.config')
    const compiler = webpack(config)
    compiler.watch(true, () => {
      resolve()
    })
  })
}

const schemaPath = path.join(PROJECT_ROOT, 'schema.graphql')

const compileGraphQL = () => {
  return new Promise((resolve) => {
    const compileRelayPath = path.join(__dirname, 'compileRelay.js')
    let relayWatchFork = fork(compileRelayPath, {stdio: 'pipe'})
    let resolved = false
    relayWatchFork.stdout.on('data', (data) => {
      const str = data.toString().trim()
      console.log(str)
      if (str.startsWith('Watching for changes to graphql...')) {
        console.log('🌧️ 🌧️ 🌧️         Watching Relay       🌧️ 🌧️ 🌧️')
        resolved = true
        resolve()
      }
    })
    relayWatchFork.stderr.on('data', (data) => {
      console.log('ERR', data.toString().trim())
    })

    let throttleId
    let tooSoonToWatch = true
    setTimeout(() => {
      tooSoonToWatch = false
      resolve()
    }, 3000)
    fs.watch(schemaPath, () => {
      if (tooSoonToWatch) return
      clearTimeout(throttleId)
      throttleId = setTimeout(() => {
        throttleId = undefined
        console.log('🌈 🌈 🌈       Restarting Relay       🌈 🌈 🌈')
        relayWatchFork.kill('SIGINT')
        relayWatchFork = fork(compileRelayPath)
      }, 3000)
    })
  })
}

const removeArtifacts = async () => {
  const generated = path.join(PROJECT_ROOT, 'packages/client/__generated__')
  const queryMap = path.join(PROJECT_ROOT, 'queryMap.json')
  try {
    await Promise.all([
      rmdir(generated, {recursive: true}),
      unlink(schemaPath),
      unlink(queryMap)
    ])
  } catch (_) {
    // probably didn't exist, noop
  }
}

const dev = async (maybeInit, isDangerous) => {
  const isInit = !fs.existsSync(path.join(TOOLBOX_ROOT, 'migrateDB.js')) || maybeInit
  if (isInit) {
    console.log('👋👋👋      Welcome to Parabol!      👋👋👋')
    await Promise.all([
      removeArtifacts(),
      compileToolbox()
    ])
  }
  await require('./toolbox/updateSchema.js').default()
  await compileGraphQL()
  if (!isDangerous) {
    fork(path.join(TOOLBOX_ROOT, 'migrateDB.js'))
    await rmdir(path.join(PROJECT_ROOT, 'dev/hot'), {recursive: true})
    await require('./buildDll')()
    await compileServers()
  }

  fork(path.join(PROJECT_ROOT, 'dev/gqlExecutor.js'))
  const redis = new Redis(process.env.REDIS_URL)
  // it's nice to flush the cache, but can comment this out if you want to test cache hits between restarts
  redis.flushall()
  require('../dev/web.js')

}

const args = process.argv.slice(2)
const isInit = args.includes('-i')
const isDangerous = isInit ? false : args.includes('-d')

dev(isInit, isDangerous)
