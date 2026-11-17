const fs = require('fs')
const path = require('path')
const getProjectRoot = require('./getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')

// The nested GitHub, GitLab & Linear types & fields that the app's persisted operations select.
// The server builds only those, and builds the rest the first time an operation needs them
const getNestedUsage = () => {
  const schemaPath = path.join(SERVER_ROOT, 'graphql', 'public', 'schema.graphql')
  const queryMapPath = path.join(PROJECT_ROOT, 'queryMap.json')
  if (!fs.existsSync(schemaPath) || !fs.existsSync(queryMapPath)) {
    console.warn(
      'No schema.graphql or queryMap.json, so the server will build every nested type. Run `pnpm relay:build` first'
    )
    return null
  }
  // the server's own graphql, so the schema is from the same module that nest-graphql-endpoint uses
  const {buildSchema, parse} = require(require.resolve('graphql', {paths: [SERVER_ROOT]}))
  const {getNestedUsage: getUsage} = require(
    require.resolve('nest-graphql-endpoint', {paths: [SERVER_ROOT]})
  )
  const schema = buildSchema(fs.readFileSync(schemaPath, 'utf8'), {assumeValidSDL: true})
  const queryMap = JSON.parse(fs.readFileSync(queryMapPath, 'utf8'))
  const documents = Object.values(queryMap).map((query) => parse(query, {noLocation: true}))
  // every nested type's name starts with _x
  return getUsage(schema, documents, ['_x'])
}

module.exports = getNestedUsage
