import {mergeSchemas} from '@graphql-tools/schema'
import {GraphQLSchema} from 'graphql'
import nestGitHubEndpoint from 'nest-graphql-endpoint/lib/nestGitHubEndpoint'
import {IntegrationProviderGitLabOAuth2} from '../../postgres/queries/getIntegrationProvidersByIds'
import githubSchema from '../../utils/githubSchema.graphql'
import composeResolvers from '../composeResolvers'
import {GQLContext} from '../graphql'
import gitlabSchema from '../nestedSchema/GitLab/gitlabSchema.graphql'
import nestGitLabEndpoint from '../nestedSchema/nestGitLabEndpoint'
import mutation from '../rootMutation'
import query from '../rootQuery'
import subscription from '../rootSubscription'
import rootTypes from '../rootTypes'
import permissions from './permissions'
import resolvers from './resolvers'

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
  resolveEndpointContext: async (
    {teamId, userId}: {teamId: string; userId: string},
    _args,
    {dataLoader}: GQLContext
  ) => {
    const token = await dataLoader
      .get('teamMemberIntegrationAuths')
      .load({service: 'gitlab', teamId, userId})
    if (!token) throw new Error('No GitLab token found')
    const {accessToken, providerId} = token
    const provider = await dataLoader.get('integrationProviders').load(providerId)
    if (!provider) throw new Error('No GitLab provider found')
    const {serverBaseUrl} = provider as IntegrationProviderGitLabOAuth2
    return {
      accessToken: accessToken!,
      baseUri: serverBaseUrl
    }
  },
  prefix: '_xGitLab',
  schemaIDL: gitlabSchema
})

const importAllStrings = (context: __WebpackModuleApi.RequireContext) => {
  return context.keys().map((id) => context(id).default)
}
const typeDefs = importAllStrings(require.context('./typeDefs', false, /.graphql$/))

const withNestedSchema = mergeSchemas({
  schemas: [withGitHubSchema, withGitLabSchema],
  typeDefs,
  resolvers: composeResolvers(resolvers, permissions)
})

const addRequestors = (schema: GraphQLSchema) => {
  const finalSchema = schema as any
  finalSchema.githubRequest = githubRequest
  finalSchema.gitlabRequest = gitlabRequest
  return finalSchema as GraphQLSchema & {
    githubRequest: typeof githubRequest
    gitlabRequest: typeof gitlabRequest
  }
}

const rootSchema = addRequestors(withNestedSchema)

export type RootSchema = typeof rootSchema
export default rootSchema
