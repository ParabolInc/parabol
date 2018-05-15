import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import DeleteTaskPayload from 'server/graphql/types/DeleteTaskPayload'
import {isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {NOTIFICATION, TASK, TASK_INVOLVES} from 'universal/utils/constants'
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import {sendTaskNotFoundError} from 'server/utils/docNotFoundErrors'

export default {
  type: DeleteTaskPayload,
  description: 'Delete (not archive!) a task',
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The taskId to delete'
    }
  },
  async resolve (source, {taskId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const task = await r.table('Task').get(taskId)
    if (!task) {
      return sendTaskNotFoundError(authToken, taskId)
    }
    const {teamId} = task
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
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
      subscribedUserIds: r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .coerceTo('array')
    })
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
