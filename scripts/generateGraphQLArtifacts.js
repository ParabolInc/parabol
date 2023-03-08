const runSchemaUpdater = require('./runSchemaUpdater')
const {generate} = require('@graphql-codegen/cli')
const codegenSchema = require('../codegen.json')
const relayCompiler = require('relay-compiler')
const cp = require('child_process')
const {promisify} = require('util')
const config = require('../relay.config')
const fs = require('fs')

const startPersistServer = async () => {
  return new Promise((resolve) => {
    const persistServer = cp.spawn('yarn', ['relay:persist'])
    const killMe = async () => {
      // persistServer.kill() doesn't work, so we go barbarian style
      // cp.exec(`kill ${persistServer.pid}`)
      process.kill(persistServer.pid)
    }
    persistServer.stdout.on('data', (data) => {
      if (!data.toString().startsWith('persist server ready')) return
      resolve(killMe)
    })
  })
}

const compileRelay = async () => {
  const exec = promisify(cp.exec)
  const killServer = await startPersistServer()
  await exec(relayCompiler)
  await killServer()
}

const generateGraphQLArtifacts = async () => {
  await runSchemaUpdater()
  await compileRelay()
  // await Promise.all([generate(codegenSchema), compileRelay()])
}

if (require.main === module) {
  generateGraphQLArtifacts()
}

module.exports = generateGraphQLArtifacts
