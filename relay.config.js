const path = require('path')

module.exports = {
  artifactDirectory: path.join(__dirname, 'packages/client/__generated__'),
  schemaExtensions: [path.join(__dirname, 'packages/client/schemaExtensions')],
  persistConfig: {
    url: 'http://localhost:2999',
    concurrency: 10
  },
  language: 'typescript',
  src: path.join(__dirname, 'packages'),
  customScalars: {
    Email: 'string',
    DateTime: 'string',
    URL: 'string',
    _xGitHubHTML: 'string',
    _xGitHubURI: 'string'
  },
  noFutureProofEnums: true,
  schema: path.join(__dirname, 'packages/server/graphql/public/schema.graphql')
}
