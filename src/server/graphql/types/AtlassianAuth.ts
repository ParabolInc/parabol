import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'

const AtlassianAuth = new GraphQLObjectType({
  name: 'AtlassianAuth',
  description: 'OAuth token for a team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    accessToken: {
      description: 'The access token to atlassian, null if no access token available',
      type: GraphQLID
    },
    atlassianUserId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        '*The id for the user used by the provider, eg SlackTeamId, GoogleUserId, githubLogin'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
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
