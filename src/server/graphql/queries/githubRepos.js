import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import GitHubIntegration from 'server/graphql/types/GitHubIntegration'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import {GITHUB} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

export default {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GitHubIntegration))),
  description: 'list of git hub repos available to the viewer',
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
      .table(GITHUB)
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('nameWithOwner')
      .default([])
  }
}
