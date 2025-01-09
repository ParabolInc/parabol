module.exports = {
  projects: {
    server: {
      schema: './packages/server/graphql/public/schema.graphql',
      documents: './packages/server/**/*',
      // not sure why this is necessary, but it picks up relay fragments on the client,
      // which are handled by the relay extension
      exclude: './packages/client/**/*'
    }
  }
}
