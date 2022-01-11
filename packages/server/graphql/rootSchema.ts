import {_xGitHubRepositoryNode} from './../../client/types/graphql'
import {mergeSchemas} from '@graphql-tools/merge'
import {GraphQLSchema} from 'graphql'
import nestGitHubEndpoint from 'nest-graphql-endpoint/lib/nestGitHubEndpoint'
import githubSchema from '../utils/githubSchema.graphql'
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
  resolveEndpointContext: ({accessToken}) => ({
    accessToken,
    headers: {Accept: 'application/vnd.github.bane-preview+json'}
  }),
  prefix: '_xGitHub',
  schemaIDL: githubSchema
})

const withLinkedGitHubSchema = mergeSchemas({
  schemas: [withGitHubSchema],
  typeDefs: `
     type _xGitHubIssue implements TaskIntegration
    `
})

export {githubRequest}
export type GitHubRequest = typeof githubRequest
;(withLinkedGitHubSchema as any).githubRequest = githubRequest
export type RootSchema = GraphQLSchema & {
  githubRequest: GitHubRequest
}
export default withLinkedGitHubSchema
