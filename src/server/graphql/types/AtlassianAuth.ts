import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import {getUserId} from 'server/utils/authorization'

const AtlassianAuth = new GraphQLObjectType({
  name: 'AtlassianAuth',
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
        'The access token to atlassian, useful for 1 hour. null if no access token available',
      type: GraphQLID,
      resolve: async ({teamId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        return dataLoader.get('freshAtlassianAccessToken').load({teamId, userId: viewerId})
      }
    },
    atlassianUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        '*The id for the user used by the provider, eg SlackTeamId, GoogleUserId, githubLogin'
    },
    cloudIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The atlassian cloud IDs that the user has granted'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    refreshToken: {
      description:
        'The refresh token to atlassian to receive a new 1-hour accessToken, always null since server secret is required',
      type: GraphQLID,
      // refreshTokens are useless without the secret
      resolve: () => null
    },
    // better to have 1 doc per team so a user can create a new team to use a different jira user
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

export default AtlassianAuth
