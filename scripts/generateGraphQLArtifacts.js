require('sucrase/register')
const {generate} = require('@graphql-codegen/cli')
const codegenSchema = require('../codegen.json')
const relayCompilerPath = require('relay-compiler')
const cp = require('child_process')
const runSchemaUpdater = require('./runSchemaUpdater').default
const RelayPersistServer = require('./RelayPersistServer').default

const generateGraphQLArtifacts = async () => {
  await runSchemaUpdater(true)
  const persistServer = new RelayPersistServer()
  const runCompiler = () =>
    new Promise((resolve) => {
      const relayCompiler = cp.exec(relayCompilerPath).on('exit', resolve)
      process.on('exit', () => {
        relayCompiler?.kill()
      })
      relayCompiler.stderr.pipe(process.stderr)
    })
  console.log('gen graphql artifacts start')
  await generate(codegenSchema)
  console.log('codegen complete')
  await runCompiler()
  console.log('relay compiler complete')
  persistServer.close()
}

if (require.main === module) {
  generateGraphQLArtifacts()
}

module.exports = generateGraphQLArtifacts
