import {mergeSchemas} from '@graphql-tools/merge'
import {GraphQLSchema} from 'graphql'
import nestGitHubEndpoint from 'nest-graphql-endpoint/lib/nestGitHubEndpoint'
import mutation from './rootMutation'
import query from './rootQuery'
import subscription from './rootSubscription'
import rootTypes from './rootTypes'

const parabolSchema = new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: rootTypes
})

const {schema: withGitHubSchema, githubRequest} = nestGitHubEndpoint({
  parentSchema: parabolSchema,
  parentType: 'GitHubIntegration',
  fieldName: 'api',
  resolveEndpointContext: ({accessToken}) => ({accessToken}),
  prefix: '_xGitHub'
})

const withLinkedGitHubSchema = mergeSchemas({
  schemas: [withGitHubSchema],
  typeDefs: `
    type _xGitHubIssue implements TaskIntegration
  `
})

export {githubRequest}
export default withLinkedGitHubSchema
