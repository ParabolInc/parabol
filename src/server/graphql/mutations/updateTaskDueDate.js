import {GraphQLID, GraphQLNonNull} from 'graphql'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TASK} from 'universal/utils/constants'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import isValidDate from 'universal/utils/isValidDate'
import getRethink from 'server/database/rethinkDriver'
import UpdateTaskDueDatePayload from 'server/graphql/types/UpdateTaskDueDatePayload'
import standardError from 'server/utils/standardError'

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
  async resolve(source, {taskId, dueDate}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)

    // VALIDATION
    const formattedDueDate = new Date(dueDate)
    const nextDueDate = isValidDate(formattedDueDate) ? formattedDueDate : null
    const task = await r.table('Task').get(taskId)
    if (!task || !isTeamMember(authToken, task.teamId)) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('Task')
      .get(taskId)
      .update({
        dueDate: nextDueDate
      })

    const data = {taskId}

    // send task updated messages
    const isPrivate = task.tags.includes('private')
    if (isPrivate) {
      publish(TASK, viewerId, UpdateTaskDueDatePayload, data, subOptions)
    } else {
      const teamMembers = await dataLoader.get('teamMembersByTeamId').load(task.teamId)
      teamMembers.forEach((teamMember) => {
        const {userId} = teamMember
        publish(TASK, userId, UpdateTaskDueDatePayload, data, subOptions)
      })
    }
    return data
  }
}
