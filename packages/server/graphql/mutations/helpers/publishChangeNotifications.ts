import getTypeFromEntityMap from 'parabol-client/utils/draftjs/getTypeFromEntityMap'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {selectNotifications} from '../../../postgres/select'
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
  const {entityMap: oldEntityMap, blocks: oldBlocks} = JSON.parse(oldTask.content)
  const {entityMap, blocks} = JSON.parse(task.content)
  const wasPrivate = oldTask.tags.includes('private')
  const isPrivate = task.tags.includes('private')
  const oldMentions = wasPrivate ? [] : getTypeFromEntityMap('MENTION', oldEntityMap)
  const mentions = isPrivate ? [] : getTypeFromEntityMap('MENTION', entityMap)
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

  // if we updated the task content, push a new one with an updated task
  const oldContentLen = oldBlocks[0] ? oldBlocks[0].text.length : 0
  if (oldContentLen < 3) {
    const contentLen = blocks[0] ? blocks[0].text.length : 0
    if (contentLen > oldContentLen && task.userId) {
      const maybeInvolvedUserIds = mentions.concat(task.userId)
      const existingTaskNotifications = await selectNotifications()
        .where('userId', 'in', maybeInvolvedUserIds)
        .where('type', '=', 'TASK_INVOLVES')
        .where('taskId', '=', task.id)
        .$narrowType<TaskInvolvesNotification>()
        .execute()
      notificationsToAdd.push(...existingTaskNotifications)
    }
  }

  // update changes in the db
  if (notificationsToAdd.length) {
    await pg.insertInto('Notification').values(notificationsToAdd).execute()
  }
  return {notificationsToAdd}
}

export default publishChangeNotifications
