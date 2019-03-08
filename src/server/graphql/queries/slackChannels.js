import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import SlackIntegration from 'server/graphql/types/SlackIntegration'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import {SLACK} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

export default {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SlackIntegration))),
  description: 'paginated list of slackChannels',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique team Id'
    }
  },
  resolve: async (source, {teamId}, {authToken}) => {
    const r = getRethink()

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      const viewerId = getUserId(authToken)
      standardError(new Error('Team not found'), {userId: viewerId})
      return []
    }

    // RESOLUTION
    return r
      .table(SLACK)
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('channelName')
      .default([])
  }
}
