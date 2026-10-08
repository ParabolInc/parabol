const path = require('path')

module.exports = {
  artifactDirectory: path.join(__dirname, 'packages/client/__generated__'),
  schemaExtensions: [path.join(__dirname, 'packages/client/schemaExtensions')],
  persistConfig: {
    // RelayPersistServer listens on a free port & whoever starts the compiler passes it along
    url: `http://localhost:${process.env.RELAY_PERSIST_PORT}`,
    concurrency: 10
  },
  language: 'typescript',
  src: path.join(__dirname, 'packages'),
  customScalarTypes: {
    Email: 'string',
    DateTime: 'string',
    URL: 'string',
    _xGitHubHTML: 'string',
    _xGitHubURI: 'string',
    RedirectURI: 'string'
  },
  noFutureProofEnums: true,
  featureFlags: {
    enforce_fragment_alias_where_ambiguous: {kind: 'disabled'}
  },
  schema: path.join(__dirname, 'packages/server/graphql/public/schema.graphql'),
  excludes: ['**/node_modules/**', '**/__generated__/**']
}
