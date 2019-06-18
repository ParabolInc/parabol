import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import {getUserId} from 'server/utils/authorization'

const SlackAuth = new GraphQLObjectType({
  name: 'SlackAuth',
  description: 'OAuth token for a team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    isActive: {
      description: 'true if an access token exists, else false',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({accessToken}) => !!accessToken
    },
    accessToken: {
      description:
        'The access token to slack, only visible to the owner. Used as a fallback to botAccessToken',
      type: GraphQLID,
      resolve: async ({accessToken, userId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? accessToken : null
      }
    },
    botUserId: {
      type: GraphQLID,
      description: 'the parabol bot user id'
    },
    botAccessToken: {
      type: GraphQLID,
      description: 'the parabol bot access token, used as primary communication',
      resolve: async ({botAccessToken, userId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? botAccessToken : null
      }
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    defaultTeamChannelId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The default channel to assign to new team notifications'
    },
    slackTeamId: {
      type: GraphQLID,
      description: 'The id of the team in slack'
    },
    slackTeamName: {
      type: GraphQLString,
      description: 'The name of the team in slack'
    },
    slackUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId in slack'
    },
    slackUserName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the user in slack'
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

export default SlackAuth
