/*
  Compiles relay fragments into documents and type definitions
  Watches all components and recompiles on change
  If the underlying schema changes, this should be re-run
*/
const {promisify} = require('util')
const pm2 = require('pm2')
const isRelayCompilerFirstTime = require('./isRelayCompilerFirstTime')

const notifyOtherPm2Processes = async () => {
  const connect = promisify(pm2.connect.bind(pm2))
  const list = promisify(pm2.list.bind(pm2))
  const sendDataToProcessId = promisify(pm2.sendDataToProcessId.bind(pm2))
  await connect()
  const processes = await list()
  const processNames = ['Dev Server', 'Webpack Servers']
  processes
    .filter((process) => {
      return processNames.includes(process.name)
    })
    .forEach((process) => {
      sendDataToProcessId({
        id: process.pm_id,
        type: 'process:msg',
        topic: true,
        data: {
          isRelayComplete: true
        }
      })
    })
}

const compileRelay = async (isWatch) => {
  const relayConfig = require('relay-config')
  const config = relayConfig.loadConfig()
  const safeConfig = JSON.parse(JSON.stringify(config))
  if (isWatch) {
    safeConfig.watch = true
    safeConfig.watchman = true
  }
  const {relayCompiler} = require('relay-compiler')
  const isFirstTime = isWatch && isRelayCompilerFirstTime()
  try {
    await relayCompiler(safeConfig)
  } catch (e) {
    if (!e.message.includes('--schema path does not exist')) throw e
    return
  }
  // only alert them on the first time to reduce noise in stdout
  // After the first time, we can use the stale artifacts to startup faster
  if (isFirstTime) {
    notifyOtherPm2Processes()
  }
}

if (require.main === module) {
  const isWatch = process.argv.find((arg) => arg === '--watch')
  compileRelay(isWatch)
}

module.exports = compileRelay
