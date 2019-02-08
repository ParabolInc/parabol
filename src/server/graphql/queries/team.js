import {GraphQLID, GraphQLNonNull} from 'graphql'
import Team from 'server/graphql/types/Team'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'

export default {
  type: Team,
  description: 'A query for a team',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team ID for the desired team'
    }
  },
  async resolve (source, {teamId}, {authToken, dataLoader}) {
    if (!isTeamMember(authToken, teamId)) {
      const viewerId = getUserId(authToken)
      standardError(new Error('Team not found'), {userId: viewerId})
      return null
    }
    return dataLoader.get('teams').load(teamId)
  }
}
