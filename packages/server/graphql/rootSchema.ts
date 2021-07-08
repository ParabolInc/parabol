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

const mergedSchema = nestGitHubEndpoint({
  parentSchema: parabolSchema,
  parentType: 'GitHubIntegration',
  fieldName: 'api',
  resolveEndpointContext: ({accessToken}) => ({accessToken}),
  prefix: '_xGitHub'
})
export default mergedSchema
