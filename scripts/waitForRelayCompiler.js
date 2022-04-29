const {promisify} = require('util')
const pm2 = require('pm2')
const isRelayCompilerFirstTime = require('./isRelayCompilerFirstTime')

const waitForRelayCompiler = async () => {
  if (!isRelayCompilerFirstTime()) return
  const connect = promisify(pm2.connect.bind(pm2))
  const list = promisify(pm2.list.bind(pm2))
  await connect()
  const processes = await list()
  const isRelayCompilerRunning = !!processes.find((process) => {
    return process.name === 'Relay Compiler'
  })
  if (!isRelayCompilerRunning) return
  return new Promise((resolve) => {
    process.on('message', (msg) => {
      if (msg.data.isRelayComplete) {
        resolve()
      }
    })
  })
}

module.exports = waitForRelayCompiler
