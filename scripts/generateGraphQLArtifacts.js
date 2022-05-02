const runSchemaUpdater = require('./runSchemaUpdater')
const compileRelay = require('./compileRelay')
const {generate} = require('@graphql-codegen/cli')
const codegenSchema = require('../codegen.json')

const generateGraphQLArtifacts = async () => {
  await runSchemaUpdater()
  return Promise.all([generate(codegenSchema), compileRelay()])
}

if (require.main === module) {
  generateGraphQLArtifacts()
}

module.exports = generateGraphQLArtifacts
