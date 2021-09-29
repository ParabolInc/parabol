module.exports = {
  projects: {
    Parabol: {
      name: 'Parabol GraphQL Schema',
      schema: ['./schema.graphql', './packages/client/clientSchema.graphql'],
      documents: './packages/**/*',
      extensions: {
        languageService: {
          useSchemaFileDefinitions: true
        },
        endpoints: {
          default: {
            url: 'http://localhost:3000/graphql'
          }
        }
      }
    }
  }
}
