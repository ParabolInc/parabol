/*
 * Combine type definitions and resolvers from multiple sources
 *  - legacy GraphQLObjectType types from `../types` which are defined TypeScript first
 *  - new SDL first types with definitions in `typeDefs` and resolvers in `types`
 *  - GitHub and GitLab schemas
 */
import {addResolversToSchema, mergeSchemas} from '@graphql-tools/schema'
import {GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString} from 'graphql'
import nestGitHubEndpoint from 'nest-graphql-endpoint/lib/nestGitHubEndpoint'
import {IntegrationProviderGitLabOAuth2} from '../../postgres/queries/getIntegrationProvidersByIds'
import githubSchema from '../../utils/githubSchema.graphql'
import composeResolvers from '../composeResolvers'
import {GQLContext} from '../graphql'
import gitlabSchema from '../nestedSchema/GitLab/gitlabSchema.graphql'
import nestGitLabEndpoint from '../nestedSchema/nestGitLabEndpoint'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import mutation from '../rootMutation'
import query from '../rootQuery'
import rootTypes from '../rootTypes'
import permissions from './permissions'
// Resolvers from SDL first definitions
import resolvers from './resolvers'

// Schema from legacy  TypeScript first definitions
const legacyParabolSchema = new GraphQLSchema({
  query,
  mutation,
  // defining a placeholder subscription because there's a bug in nest-graphql-schema that prefixes to _xGitHubSubscription if missing
  subscription: new GraphQLObjectType({name: 'Subscription', fields: {}}),
  types: rootTypes
})

const {schema: legacyParabolWithGitHubSchema, githubRequest} = nestGitHubEndpoint({
  parentSchema: legacyParabolSchema,
  parentType: 'GitHubIntegration',
  fieldName: 'api',
  resolveEndpointContext: ({accessToken}) => ({
    accessToken,
    headers: {Accept: 'application/vnd.github.bane-preview+json'}
  }),
  prefix: '_xGitHub',
  schemaIDL: githubSchema
})

const {schema: legacyParabolWithGitLabSchema, gitlabRequest} = nestGitLabEndpoint({
  parentSchema: legacyParabolSchema,
  parentType: 'GitLabIntegration',
  fieldName: 'api',
  resolveEndpointContext: async (
    {teamId, userId}: {teamId: string; userId: string},
    _args,
    {dataLoader}: GQLContext
  ) => {
    const token = await dataLoader.get('freshGitlabAuth').load({teamId, userId})
    if (!token) throw new Error('No GitLab token found')
    const {accessToken, providerId} = token
    const provider = await dataLoader.get('integrationProviders').load(providerId)
    if (!provider) throw new Error('No GitLab provider found')
    const {serverBaseUrl} = provider as IntegrationProviderGitLabOAuth2
    return {
      accessToken: accessToken!,
      baseUri: serverBaseUrl,
      dataLoaderOptions: {maxBatchSize: 5}
    }
  },
  prefix: '_xGitLab',
  schemaIDL: gitlabSchema
})

const importAllStrings = (context: __WebpackModuleApi.RequireContext) => {
  return context.keys().map((id) => context(id).default)
}

// Types from SDL first
const typeDefs = importAllStrings(require.context('./typeDefs', false, /.graphql$/))

const legacyParabolWithNestedSchema = mergeSchemas({
  schemas: [legacyParabolWithGitHubSchema, legacyParabolWithGitLabSchema],
  typeDefs
})

// IMPORTANT! mergeSchemas has a bug where resolvers will be overwritten by the default resolvers
// See https://github.com/ardatan/graphql-tools/issues/4367
const parabolWithNestedResolversSchema = addResolversToSchema({
  schema: legacyParabolWithNestedSchema,
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

const rootSchema = addRequestors(resolveTypesForMutationPayloads(parabolWithNestedResolversSchema))
const issue = rootSchema.getType('_xGitHubIssue') as GraphQLObjectType
const fields = issue.getFields()
const urlField = fields['url']!
urlField.type = new GraphQLNonNull(GraphQLString)

export type RootSchema = typeof rootSchema
export default rootSchema
