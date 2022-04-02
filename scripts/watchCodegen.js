/*
  Generates typed documents from GraphQL schemas.
  Useful for our own public/private schemas
  as well as from integrations.
  Reruns whenever the underlying schema file changes
*/
const watchCodegen = async () => {
  const {generate} = require('@graphql-codegen/cli')
  const config = require('../codegen.json')
  // watches the `schema` files and re-runs if it changes
  // on the first run, schemas won't exist
  // When GQL Schema Compiler finished, the schemas will exist & it'll rerun
  config.watch = true
  // output is pretty verbose, comment this out to debug
  config.silent = true
  generate(config)
}

watchCodegen()
