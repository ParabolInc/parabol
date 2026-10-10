/*
  Compiles relay fragments into documents and type definitions
  Watches all components and recompiles on change
  Reprints the GraphQL schema & recompiles when the typeDefs change
  `pnpm dev` runs the same thing as part of the whole stack
*/
import fs from 'fs'
import path from 'path'
import RelayDevServer from './devStack/RelayDevServer.mts'
import TaskLog from './devStack/TaskLog.mts'
import getProjectRoot from './webpack/utils/getProjectRoot.js'

const relayWatch = async () => {
  const logDir = path.join(getProjectRoot(), 'dev', 'logs')
  fs.mkdirSync(logDir, {recursive: true})
  const relayDevServer = new RelayDevServer({log: new TaskLog('Relay Compiler', logDir)})
  const stop = async () => {
    await relayDevServer.stop()
    process.exit()
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
  process.on('exit', () => relayDevServer.killNow())
  await relayDevServer.start()
}

relayWatch()
