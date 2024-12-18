require('sucrase/register')
const {generate} = require('@graphql-codegen/cli')
const codegenSchema = require('../codegen.json')
const relayCompilerPath = require('relay-compiler')
const cp = require('child_process')
const process = require('process')
const runSchemaUpdater = require('./runSchemaUpdater').default
const RelayPersistServer = require('./RelayPersistServer').default
const {Logger} = require('../packages/server/utils/Logger')

const generateGraphQLArtifacts = async () => {
  await runSchemaUpdater(true)
  const persistServer = new RelayPersistServer()
  const runCompiler = (cwd) =>
    new Promise((resolve) => {
      const relayCompiler = cp.exec(relayCompilerPath, {cwd}).on('exit', resolve)
      process.on('exit', () => {
        relayCompiler?.kill()
      })
      relayCompiler.stderr.pipe(process.stderr)
    })
  Logger.log('gen graphql artifacts start')
  await generate(codegenSchema)
  Logger.log('codegen complete')
  await runCompiler(process.cwd())
  Logger.log('relay compiler client complete')
  await runCompiler(`${process.cwd()}/packages/mattermost-plugin`)
  Logger.log('relay compiler mattermost-plugin complete')
  persistServer.close()
}

if (require.main === module) {
  generateGraphQLArtifacts()
}

module.exports = generateGraphQLArtifacts
