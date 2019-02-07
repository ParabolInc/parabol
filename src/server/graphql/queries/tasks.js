import {GraphQLID, GraphQLNonNull} from 'graphql'
import {forwardConnectionArgs} from 'graphql-relay'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import {TaskConnection} from 'server/graphql/types/Task'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import connectionFromTasks from 'server/graphql/queries/helpers/connectionFromTasks'
import standardError from 'server/utils/standardError'

export default {
  type: new GraphQLNonNull(TaskConnection),
  args: {
    ...forwardConnectionArgs,
    after: {
      type: GraphQLISO8601Type,
      description: 'the datetime cursor'
    },
    teamId: {
      type: GraphQLID,
      description: 'The unique team ID'
    }
  },
  async resolve (source, {teamId}, {authToken, dataLoader}) {
    // AUTH
    const userId = getUserId(authToken)
    let tasks
    if (teamId) {
      if (!isTeamMember(authToken, teamId)) {
        standardError(new Error('Team not found'), {userId})
        return null
      }
      tasks = await dataLoader.get('tasksByTeamId').load(teamId)
    } else {
      tasks = await dataLoader.get('tasksByUserId').load(userId)
    }

    // RESOLUTION
    return connectionFromTasks(tasks)
  }
}
