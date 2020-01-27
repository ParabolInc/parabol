import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from '../types/GraphQLISO8601Type'
import {TaskConnection} from '../types/Task'
import connectionFromTasks from './helpers/connectionFromTasks'

export default {
  type: new GraphQLNonNull(TaskConnection),
  args: {
    first: {
      type: GraphQLInt
    },
    after: {
      type: GraphQLISO8601Type,
      description: 'the datetime cursor'
    },
    teamId: {
      type: GraphQLID,
      description: 'The unique team ID'
    }
  },
  async resolve(_source, {teamId}, {authToken, dataLoader}: GQLContext) {
    // AUTH
    const viewerId = getUserId(authToken)
    if (teamId && !isTeamMember(authToken, teamId)) {
      standardError(new Error('Team not found'), {userId: viewerId})
      return connectionFromTasks([])
    }
    const teamIds = teamId ? [teamId] : authToken.tms || []
    const tasks = await dataLoader.get('userTasks').load({userId: viewerId, teamIds})
    return connectionFromTasks(tasks)
  }
}
