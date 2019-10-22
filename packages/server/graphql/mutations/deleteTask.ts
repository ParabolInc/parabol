import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import DeleteTaskPayload from '../types/DeleteTaskPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {NOTIFICATION, TASK, TASK_INVOLVES} from '../../../client/utils/constants'
import getTypeFromEntityMap from '../../../client/utils/draftjs/getTypeFromEntityMap'
import standardError from '../../utils/standardError'

export default {
  type: DeleteTaskPayload,
  description: 'Delete (not archive!) a task',
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The taskId to delete'
    }
  },
  async resolve(_source, {taskId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const task = await r
      .table('Task')
      .get(taskId)
      .run()
    if (!task) {
      return {error: {message: 'Task not found'}}
    }
    const {teamId} = task
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const {subscribedUserIds} = await r({
      task: r
        .table('Task')
        .get(taskId)
        .delete(),
      taskHistory: r
        .table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {
          index: 'taskIdUpdatedAt'
        })
        .delete(),
      subscribedUserIds: (r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .coerceTo('array') as unknown) as string[]
    }).run()
    const {content, tags, userId: taskUserId} = task

    // handle notifications
    const {entityMap} = JSON.parse(content)
    const userIdsWithNotifications = getTypeFromEntityMap('MENTION', entityMap).concat(taskUserId)
    const clearedNotifications = await r
      .table('Notification')
      .getAll(r.args(userIdsWithNotifications), {index: 'userIds'})
      .filter({
        taskId,
        type: TASK_INVOLVES
      })
      .delete({returnChanges: true})('changes')('old_val')
      .default([])
      .run()

    const data = {task, notifications: clearedNotifications}
    clearedNotifications.forEach((notification) => {
      const {
        userIds: [notificationUserId]
      } = notification
      publish(NOTIFICATION, notificationUserId, DeleteTaskPayload, data, subOptions)
    })

    const isPrivate = tags.includes('private')
    subscribedUserIds.forEach((userId) => {
      if (!isPrivate || userId === taskUserId) {
        publish(TASK, userId, DeleteTaskPayload, data, subOptions)
      }
    })
    return data
  }
}
