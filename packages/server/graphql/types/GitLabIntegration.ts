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

const GitLabIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'GitLabIntegration',
  description: 'OAuth token for a team member',
  fields: () => ({
    availableProviders: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(IntegrationProvider))),
      description: 'A list of available Integration Providers',
      resolve: async ({teamId}, _args, {dataLoader}) => {
        const orgId = (await dataLoader.get('teams').load(teamId)).orgId
        const providers = await dataLoader.get('integrationProvidersByType').load({
          providerType: 'GITLAB',
          teamId,
          orgId
        })
        return providers
      }
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'composite key',
      resolve: ({teamId, userId}) => GitLabIntegrationId.join(teamId, userId)
    },
    accessToken: {
      description: 'The Gitlab access token to gitlab',
      type: GraphQLID,
      resolve: async ({accessToken, userId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? accessToken : null
      }
    },
    activeProvider: {
      description: 'The active Integration Provider details to be used with token',
      type: IntegrationProvider
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    oauthRefreshToken: {
      description: 'The Gitlab OAUTH2 refresh token',
      type: GraphQLID,
      resolve: async ({oauthRefreshToken, userId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? oauthRefreshToken : null
      }
    },
    isActive: {
      description: 'true if an access token exists, else false',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({accessToken}) => !!accessToken
    },
    scopes: {
      description: "The token's scopes",
      type: GraphQLList(GraphQLString)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that the token is linked to'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the token was updated at'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The user that the access token is attached to'
    }
  })
})

export default GitLabIntegration
