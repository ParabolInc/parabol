import {GraphQLSchema} from 'graphql'
import addGitHubToSchema from './githubSchema/addGitHubToSchema'
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

const resolveAccessToken = (source) => source.accessToken
const mergedSchema = addGitHubToSchema(parabolSchema, 'GitHubIntegration', resolveAccessToken, {
  prefix: '_xGitHub'
})
export default mergedSchema
