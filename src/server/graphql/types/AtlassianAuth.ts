import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {decode} from 'jsonwebtoken'
import getRethink from 'server/database/rethinkDriver'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import AtlassianManager from 'server/utils/AtlassianManager'
import {getUserId} from 'server/utils/authorization'
import {IAuthToken} from 'universal/types/graphql'

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
      resolve: async (source, _args, {authToken}) => {
        const r = getRethink()
        const now = new Date()
        const {accessToken: existingAccessToken, refreshToken, userId} = source
        const viewerId = getUserId(authToken)
        if (viewerId !== userId || !existingAccessToken || !refreshToken) return null
        const decodedToken = decode(existingAccessToken) as IAuthToken
        if (!decodedToken || decodedToken.exp >= Math.floor(now.getTime() / 1000)) {
          return existingAccessToken
        }
        // fetch a new one
        const manager = await AtlassianManager.refresh(refreshToken)
        const {accessToken} = manager
        // not exactly a pure query, but a guaranteed useful token is too nice to pass up
        await r.table('AtlassianAuth').update({accessToken, updatedAt: now})
        return accessToken
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
        'The refresh token to atlassian to receive a new 1-hour accessToken, null if no access token available',
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

export default AtlassianAuth
