import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLBoolean, GraphQLList} from 'graphql'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from '../types/GraphQLISO8601Type'
import {TaskConnection} from '../types/Task'
import connectionFromTasks from './helpers/connectionFromTasks'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'

export default {
  type: new GraphQLNonNull(TaskConnection),
  args: {
    first: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the number of tasks to return'
    },
    after: {
      type: GraphQLISO8601Type,
      description: 'the datetime cursor'
    },
    userIds: {
      type: GraphQLList(GraphQLNonNull(GraphQLID)),
      description: 'a list of user Ids'
    },
    teamIds: {
      type: GraphQLList(GraphQLNonNull(GraphQLID)),
      description: 'a list of team Ids'
    },
    archived: {
      type: GraphQLBoolean,
      description: 'true to only return archived tasks; false to return active tasks',
      defaultValue: false
    }
  },
  async resolve(
    {tms},
    {first, after, userIds, teamIds, archived},
    {authToken, dataLoader}: GQLContext
  ) {
    // AUTH
    const viewerId = getUserId(authToken)
    if (teamIds) {
      for (const teamId of teamIds) {
        // cannot query tasks from teams the viewer is not in
        if (!isTeamMember(authToken, teamId)) {
          standardError(new Error('Team not found'), {userId: viewerId})
          return connectionFromTasks([])
        }
      }
    }

    let userIdsForQuery = userIds
    let teamIdsForQuery = teamIds

    if (!userIds && !teamIds) {
      userIdsForQuery = [viewerId]
      teamIdsForQuery = tms
    } else if (userIds && !teamIds) {
      const users = await dataLoader.get('users').loadMany(userIds)
      teamIdsForQuery = users
        .map(({tms}) => tms)
        .flat()
        .filter((teamId) => isTeamMember(authToken, teamId))
    } else if (!userIds && teamIds) {
      const loadedTeamMembers = await dataLoader.get('teamMembersByTeamId').loadMany(teamIds)
      const userIdsForTeamIds = loadedTeamMembers.flat().map(({userId}) => userId)
      userIdsForQuery = [...new Set(userIdsForTeamIds.flat())]
    }

    const tasks = await dataLoader.get('userTasks').load({
      first: first,
      after: after,
      userIds: userIdsForQuery,
      teamIds: teamIdsForQuery,
      archived: archived
    })

    const filteredTasks = tasks.filter((task) => {
      if (isTaskPrivate(task.tags) && task.userId !== viewerId) return false
      return true
    })
    return connectionFromTasks(filteredTasks)
  }
}
