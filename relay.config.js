const path = require('path')

module.exports = {
  'artifact-directory': path.join(__dirname, 'packages/client/src/__generated__'),
  'client-schema': path.join(__dirname, 'packages/client/clientSchema.graphql'),
  'persist-function': path.join(__dirname, 'packages/server/src/graphql/persistFunction.js'),
  'persist-output': path.join(__dirname, 'packages/server/src/graphql/queryMap.json'),
  language: 'typescript',
  src: path.join(__dirname, 'packages'),
  'custom-scalars': {
    Email: 'string',
    DateTime: 'string',
    URL: 'string'
  },
  extensions: ['js', 'ts', 'tsx'],
  'no-future-proof-enums': true,
  schema: path.join(__dirname, 'build/schema.json'),
  include: ['client/**', 'server/**'],
  exclude: [
    'gql-executor/**',
    'cypress/**',
    'server/lib/**',
    '**/lib/**',
    '**/node_modules/**',
    '**/githubSchema.graphql',
    '**/githubQueries/**',
    '**/__generated__/**'
  ],
  // quiet: true,
  watchman: false
}
