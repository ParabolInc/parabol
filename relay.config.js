module.exports = {
  artifactDirectory: './packages/client/__generated__',
  'client-schema': './packages/client/clientSchema.graphql',
  'persist-output': './packages/server/graphql/queryMap.json',
  language: 'typescript',
  src: './packages/client',
  customScalars: {
    Email: 'string',
    DateTime: 'string',
    URL: 'string'
  },
  extensions: ['js', 'ts', 'tsx'],
  noFutureProofEnums: true,
  schema: './build/schema.json',
  exclude: [
    '**/node_modules/**',
    '**/githubSchema.graphql',
    '**/githubQueries/**',
    '**/__generated__/**'
  ],
  quiet: true,
  watchMan: false
}
