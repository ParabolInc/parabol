import {mergeSchemas} from '@graphql-tools/merge'
import {GraphQLSchema} from 'graphql'
import nestGitHubEndpoint from 'nest-graphql-endpoint/lib/nestGitHubEndpoint'
import githubSchema from '../utils/githubSchema.graphql'
import nestGitLabEndpoint from './nestedSchema/nestGitLabEndpoint'
import gitlabSchema from './nestedSchema/GitLab/gitlabSchema.graphql'
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

const {schema: withGitLabSchema, gitlabRequest} = nestGitLabEndpoint({
  parentSchema: parabolSchema,
  parentType: 'GitLabIntegration',
  fieldName: 'api',
  resolveEndpointContext: ({accessToken, activeProvider}) => {
    const context = {
      accessToken,
      baseUri: activeProvider.serverBaseUri,
      headers: {Accept: 'application/json'}
    }
    return context
  },
  prefix: '_xGitLab',
  schemaIDL: gitlabSchema
})

const withNestedSchema = mergeSchemas({
  schemas: [withGitHubSchema, withGitLabSchema],
  typeDefs: `
    type _xGitHubIssue implements TaskIntegration
  `
})

export {githubRequest}
export type GitHubRequest = typeof githubRequest
;(withNestedSchema as any).githubRequest = githubRequest

export {gitlabRequest}
export type GitLabRequest = typeof gitlabRequest
;(withNestedSchema as any).gitlabRequest = gitlabRequest

export type RootSchema = GraphQLSchema & {
  githubRequest: GitHubRequest
  gitlabRequest: GitLabRequest
}

export default withNestedSchema
