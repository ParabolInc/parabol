const webpack = require('webpack')
const cp = require('child_process')
const {promisify} = require('util')
const path = require('path')

const gqlServers = async () => {
  await new Promise((resolve) => {
    const config = require('./webpack/dev.servers.config')
    const compiler = webpack(config)
    // const start = Date.now()
    compiler.run(() => {
      // console./log('servers done', (Date.now() - start) / 1000)
      resolve()
    })
  })
  require('../dev/web.js')

  // test a cluster in development
  const executorPath = path.join(__dirname, '../dev/gqlExecutor.js')
  const fork = promisify(cp.fork)
  const {SERVER_ID, DEV_NUM_EXECUTORS} = process.env
  // allow 1 - 8 executors to run in dev
  const numExecutors = Math.min(Math.max(Number(DEV_NUM_EXECUTORS) || 1, 1), 8)
  for (let i = 0; i < numExecutors; i++) {
    const forkServerId = String(Number(SERVER_ID) + i + 1)
    const env = {...process.env, SERVER_ID: forkServerId}
    // fork all gql executors so they run in their own process
    // so publishers (web.js) can't block consumers (gql executors)
    fork(executorPath, {env})
  }
}

gqlServers()
