import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import {getUserId} from '../../utils/authorization'

const AzureDevopsAuth = new GraphQLObjectType({
  name: 'AzureDevopsAuth',
  description: 'OAuth token for a team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    isActive: {
      description: 'true if the auth is valid, else false',
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    accessToken: {
      description:
        'The access token to Azure Devops, useful for 1 hour. null if no access token available',
      type: GraphQLID,
      resolve: async ({teamId, userId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        if (viewerId !== userId) return null
        return dataLoader.get('freshAzureDevopsAccessToken').load({teamId, userId: viewerId})
      }
    },
    accountId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The Azure Devops account ID'
    },
    organizations: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The Azure Devops organization that the user has granted'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    refreshToken: {
      description:
        'The refresh token to Azure Devops to receive a new 1-hour accessToken, always null since server secret is required',
      type: GraphQLID,
      // refreshTokens are useless without the secret
      resolve: () => null
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

export default AzureDevopsAuth
