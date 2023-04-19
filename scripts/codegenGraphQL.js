/*
  Generates typed documents from GraphQL schemas.
  Useful for our own public/private schemas
  as well as from integrations.
  Reruns whenever the underlying schema file changes
*/
require('sucrase/register')
const {generate} = require('@graphql-codegen/cli')
const path = require('path')
const config = require('../codegen.json')
const waitForFileExists = require('./waitForFileExists').default

const codegenGraphQL = async () => {
  const schemaPath = path.join(__dirname, '../packages/server/graphql/public/schema.graphql')
  const schemaExists = await waitForFileExists(schemaPath, 20000)
  if (!schemaExists) throw Error('GraphQL Schema Not Available. Run `yarn relay:build`')
  const watch = process.argv.find((arg) => arg === '--watch')
  if (watch) {
    // watches the `schema` files and re-runs if it changes
    // on the first run, schemas won't exist
    // When GQL Schema Compiler finished, the schemas will exist & it'll rerun
    config.watch = true
    // output is pretty verbose, comment this out to debug
    config.silent = true
  }
  generate(config)
}

codegenGraphQL()
