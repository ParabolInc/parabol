import {getAllNodesAttributesByType} from '../../../../client/shared/tiptap/getAllNodesAttributesByType'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {Task} from '../../../postgres/types'
import {TaskInvolvesNotification} from '../../../postgres/types/Notification'
import {analytics} from '../../../utils/analytics/analytics'

const publishChangeNotifications = async (
  task: Task,
  oldTask: Task,
  changeUser: {id: string; email: string},
  usersToIgnore: string[]
) => {
  const pg = getKysely()
  const changeAuthorId = `${changeUser.id}::${task.teamId}`
  const oldContentJSON = JSON.parse(oldTask.content)
  const contentJSON = JSON.parse(task.content)
  const wasPrivate = oldTask.tags.includes('private')
  const isPrivate = task.tags.includes('private')
  const oldMentions = wasPrivate
    ? []
    : getAllNodesAttributesByType<{id: string}>(oldContentJSON, 'mention').map(({id}) => id)
  const mentions = isPrivate
    ? []
    : getAllNodesAttributesByType<{id: string}>(contentJSON, 'mention').map(({id}) => id)
  // intersect the mentions to get the ones to add and remove
  const userIdsToRemove = oldMentions.filter((userId) => !mentions.includes(userId))
  const notificationsToAdd = mentions
    .filter(
      (userId) =>
        // it didn't already exist
        !oldMentions.includes(userId) &&
        // it isn't the owner (they get the assign notification)
        userId !== task.userId &&
        // it isn't the person changing it
        changeUser.id !== userId &&
        // it isn't someone in a meeting
        !usersToIgnore.includes(userId)
    )
    .map((userId) => ({
      id: generateUID(),
      type: 'TASK_INVOLVES' as const,
      userId,
      involvement: 'MENTIONEE' as TaskInvolvesNotification['involvement'],
      taskId: task.id,
      changeAuthorId,
      teamId: task.teamId
    }))

  mentions.forEach((mentionedUserId) => {
    analytics.mentionedOnTask(changeUser, mentionedUserId, task.teamId)
  })
  // add in the assignee changes
  if (oldTask.userId && oldTask.userId !== task.userId) {
    if (task.userId && task.userId !== changeUser.id && !usersToIgnore.includes(task.userId)) {
      notificationsToAdd.push({
        id: generateUID(),
        type: 'TASK_INVOLVES' as const,
        userId: task.userId,
        involvement: 'ASSIGNEE' as const,
        taskId: task.id,
        changeAuthorId,
        teamId: task.teamId
      })
    }
    userIdsToRemove.push(oldTask.userId)
  }

  // update changes in the db
  if (notificationsToAdd.length) {
    await pg.insertInto('Notification').values(notificationsToAdd).execute()
  }
  return {notificationsToAdd}
}

export default publishChangeNotifications
