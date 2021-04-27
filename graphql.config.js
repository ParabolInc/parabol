module.exports = {
  projects: {
    Parabol: {
      schemaPath: './schema.graphql',
      name: 'Parabol GraphQL Schema',
      includes: ['*'],
      excludes: [
        'githubSchema.graphql',
        './packages/client/utils/githubQueries/*',
        'packages/server/utils/githubQueries/*'
      ]
    },
    GitHub: {
      schemaPath: './packages/server/utils/githubSchema.graphql',
      name: 'GitHub GraphQL Schema',
      includes: [
        './packages/client/utils/githubQueries/*.graphql',
        './packages/server/utils/githubQueries/*'
      ],
      extensions: {
        schemaTypesPath: 'packages/client/utils/githubQueries/types'
      }
    }
  }
}
