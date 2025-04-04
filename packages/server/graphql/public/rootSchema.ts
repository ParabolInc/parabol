/*
 * Combine type definitions and resolvers from multiple sources
 *  - legacy GraphQLObjectType types from `../types` which are defined TypeScript first
 *  - new SDL first types with definitions in `typeDefs` and resolvers in `types`
 *  - GitHub and GitLab schemas
 */
import {addResolversToSchema, mergeSchemas} from '@graphql-tools/schema'
import {GraphQLObjectType, GraphQLSchema} from 'graphql'
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

// Schema from legacy TypeScript first definitions instead of SDL pattern
const legacyTypeDefs = new GraphQLSchema({
  query,
  mutation,
  // defining a placeholder subscription because there's a bug in nest-graphql-schema that prefixes to _xGitHubSubscription if missing
  subscription: new GraphQLObjectType({name: 'Subscription', fields: {}}),
  types: rootTypes
})

const importAllStrings = (context: __WebpackModuleApi.RequireContext) => {
  return context.keys().map((id) => context(id).default)
}

// Merge old POJO definitions with SDL definitions
const parabolTypeDefs = mergeSchemas({
  schemas: [legacyTypeDefs],
  typeDefs: importAllStrings(require.context('./typeDefs', false, /.graphql$/))
})

const {schema: typeDefsWithGitHub, githubRequest} = nestGitHubEndpoint({
  parentSchema: parabolTypeDefs,
  parentType: 'GitHubIntegration',
  fieldName: 'api',
  resolveEndpointContext: ({accessToken}) => ({
    accessToken,
    headers: {Accept: 'application/vnd.github.bane-preview+json'}
  }),
  prefix: '_xGitHub',
  schemaIDL: githubSchema
})

const {schema: typeDefsWithGitHubGitLab, gitlabRequest} = nestGitLabEndpoint({
  parentSchema: typeDefsWithGitHub,
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

// IMPORTANT! mergeSchemas has a bug where resolvers will be overwritten by the default resolvers
// See https://github.com/ardatan/graphql-tools/issues/4367
const publicSchema = resolveTypesForMutationPayloads(
  addResolversToSchema({
    schema: typeDefsWithGitHubGitLab,
    resolvers: composeResolvers(resolvers, permissions),
    inheritResolversFromInterfaces: true
  })
)

export {githubRequest, gitlabRequest}
export default publicSchema
