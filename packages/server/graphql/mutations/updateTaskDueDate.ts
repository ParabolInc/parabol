import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isValidDate from 'parabol-client/utils/isValidDate'
import getKysely from '../../postgres/getKysely'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import GraphQLISO8601Type from '../types/GraphQLISO8601Type'
import UpdateTaskDueDatePayload from '../types/UpdateTaskDueDatePayload'
import {GQLContext} from './../graphql'

export default {
  type: UpdateTaskDueDatePayload,
  description: 'Set or unset the due date of a task',
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The task id'
    },
    dueDate: {
      type: GraphQLISO8601Type,
      description: 'the new due date. if not a valid date, it will unset the due date'
    }
  },
  async resolve(
    _source: unknown,
    {taskId, dueDate}: {taskId: string; dueDate: string | null},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)

    // VALIDATION
    const formattedDueDate = dueDate && new Date(dueDate)
    const nextDueDate = isValidDate(formattedDueDate) ? formattedDueDate : null
    const [task, viewer] = await Promise.all([
      dataLoader.get('tasks').load(taskId),
      dataLoader.get('users').loadNonNull(viewerId)
    ])
    if (!task || !isTeamMember(authToken, task.teamId)) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }

    // RESOLUTION
    await pg.updateTable('Task').set({dueDate: nextDueDate}).where('id', '=', taskId).execute()
    dataLoader.clearAll('tasks')
    const data = {taskId}

    // send task updated messages
    const isPrivate = task.tags.includes('private')
    if (isPrivate) {
      publish(SubscriptionChannel.TASK, viewerId, 'UpdateTaskDueDatePayload', data, subOptions)
    } else {
      const teamMembers = await dataLoader.get('teamMembersByTeamId').load(task.teamId)
      teamMembers.forEach((teamMember) => {
        const {userId} = teamMember
        publish(SubscriptionChannel.TASK, userId, 'UpdateTaskDueDatePayload', data, subOptions)
      })
    }
    analytics.taskDueDateSet(viewer, task.teamId, taskId)
    return data
  }
}
