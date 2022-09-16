import {GraphQLID, GraphQLNonNull} from 'graphql'
import {getUserId, isSuperUser, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import Team from '../types/Team'

// HANDLED_OPS is a list of operations that we gracefully handle on the client, so we don't want to report them to sentry
const HANDLED_OPS = ['TeamRootQuery']

export default {
  type: Team,
  description: 'A query for a team',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team ID for the desired team'
    }
  },
  async resolve(_source: unknown, {teamId}, {authToken, dataLoader}: GQLContext, info) {
    if (!isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
      const viewerId = getUserId(authToken)
      if (!HANDLED_OPS.includes(info.operation.name.value)) {
        standardError(new Error('Team not found'), {userId: viewerId})
      }
      return null
    }
    return dataLoader.get('teams').load(teamId)
  }
}
