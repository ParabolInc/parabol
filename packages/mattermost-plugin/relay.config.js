const path = require('path')

module.exports = {
  artifactDirectory: path.join(__dirname, '__generated__'),
  persistConfig: {
    url: 'http://localhost:2999',
    concurrency: 10
  },
  language: 'typescript',
  src: path.join(__dirname),
  customScalarTypes: {
    Email: 'string',
    DateTime: 'string',
    URL: 'string',
    _xGitHubHTML: 'string',
    _xGitHubURI: 'string'
  },
  noFutureProofEnums: true,
  schema: path.join(__dirname, '../server/graphql/public/schema.graphql'),
}
