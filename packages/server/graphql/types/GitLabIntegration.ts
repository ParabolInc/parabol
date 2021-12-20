import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import GitLabIntegrationId from 'parabol-client/shared/gqlIds/GitLabIntegrationId'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import IntegrationProvider from './IntegrationProvider'

const OAuth2TokenMetadata = new GraphQLObjectType<any, GQLContext>({
  name: 'OAuth2TokenMetadata',
  description: 'OAuth2 token metadata for an Integration Provider',
  fields: () => ({
    accessToken: {
      type: GraphQLString,
      description: 'The access token'
    },
    refreshToken: {
      type: GraphQLString,
      description: 'The refresh token'
    },
    scopes: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      description: 'The scopes this token is valid for'
    }
  })
})

const GitLabIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'GitLabIntegration',
  description: 'Gitlab integration data for a given user',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'composite key',
      resolve: ({teamId, userId}) => GitLabIntegrationId.join(teamId, userId)
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the token was updated at'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that the token is linked to'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The user that the access token is attached to'
    },
    isActive: {
      description: 'true if an access token exists, else false',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({tokenMetadata}) => !!tokenMetadata?.accessToken
    },
    tokenMetadata: {
      type: OAuth2TokenMetadata,
      description: 'The active Integration Provider details to be used with token',
      resolve: ({userId, tokenMetadata}, _args: unknown, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? tokenMetadata : null
      }
    },
    activeProvider: {
      description: 'The active Integration Provider details to be used with token',
      type: IntegrationProvider
    },
    availableProviders: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(IntegrationProvider))),
      description: 'A list of available Integration Providers',
      resolve: async ({teamId}, _args, {dataLoader}) => {
        const orgId = (await dataLoader.get('teams').load(teamId)).orgId
        const providers = await dataLoader.get('integrationProvidersByType').load({
          type: 'gitlab',
          teamId,
          orgId
        })
        return providers
      }
    }
  })
})

export default GitLabIntegration
