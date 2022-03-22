import {mergeSchemas} from '@graphql-tools/schema'
import {GraphQLResolveInfo, GraphQLSchema} from 'graphql'
import nestGitHubEndpoint from 'nest-graphql-endpoint/lib/nestGitHubEndpoint'
import {IntegrationProviderGitLabOAuth2} from '../postgres/queries/getIntegrationProvidersByIds'
import githubSchema from '../utils/githubSchema.graphql'
import {GQLContext} from './graphql'
import gitlabSchema from './nestedSchema/GitLab/gitlabSchema.graphql'
import nestGitLabEndpoint from './nestedSchema/nestGitLabEndpoint'
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

// Use
const resolveToFieldNameOrAlias = (
  source: any,
  _args: unknown,
  _context: unknown,
  info: GraphQLResolveInfo
) => {
  // fieldNodes will always have 1+ node
  const key = info.fieldNodes[0]!.alias?.value ?? info.fieldName
  return source[key]
}

const withNestedSchema = mergeSchemas({
  schemas: [withGitHubSchema, withGitLabSchema],
  typeDefs: `
    type _xGitHubIssue implements TaskIntegration
    type _xGitLabIssue implements TaskIntegration
    type _xGitHubRepository implements RepoIntegration
    type _xGitLabProject implements RepoIntegration
    extend type _xGitHubRepository {
      service: IntegrationProviderServiceEnum!
    }
    `,
  // TODO apply this resolver to every type in the GitHub/GitLab schema
  // It is necessary any time client code uses an alias inside a wrapper
  resolvers: {
    _xGitHubIssue: {
      url: resolveToFieldNameOrAlias
    },
    _xGitHubRepository: {
      __interfaces: () => ['RepoIntegration'],
      __isTypeOf: ({nameWithOwner}: {nameWithOwner?: string}) => !!nameWithOwner,
      service: () => 'github'
    },
    _xGitLabProject: {
      __interfaces: () => ['RepoIntegration'],
      // __isTypeOf: ({fullPath}) => !!fullPath
      __isTypeOf: ({__typename}) => __typename === '_xGitLabProject',
      service: () => 'gitlab'
    },
    _xGitLabQuery: {
      projects: resolveToFieldNameOrAlias
    }
  }
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
