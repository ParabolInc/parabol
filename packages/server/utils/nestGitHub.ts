import {GraphQLSchema} from 'graphql'
import nestGitHubEndpoint from 'nest-graphql-endpoint/lib/nestGitHubEndpoint'
import githubSchema from './githubSchema.graphql'
// Resolvers from SDL first definitions

export const nestGitHub = (parentSchema: GraphQLSchema) =>
  nestGitHubEndpoint({
    parentSchema,
    parentType: 'GitHubIntegration',
    fieldName: 'api',
    resolveEndpointContext: ({accessToken}) => ({
      accessToken,
      headers: {Accept: 'application/vnd.github.bane-preview+json'}
    }),
    prefix: '_xGitHub',
    schemaIDL: githubSchema
  })
