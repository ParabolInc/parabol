import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const deleteTask: MutationResolvers['deleteTask'] = async (
  _source,
  {taskId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const task = await dataLoader.get('tasks').load(taskId)
  if (!task) {
    return {error: {message: 'Task not found'}}
  }
  const {teamId} = task
  // RESOLUTION
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const subscribedUserIds = teamMembers.map(({userId}) => userId)
  await pg.deleteFrom('Task').where('id', '=', taskId).execute()
  const {tags, userId: taskUserId} = task

  const data = {task}
  const isPrivate = tags.includes('private')
  subscribedUserIds.forEach((userId) => {
    if (!isPrivate || userId === taskUserId) {
      publish(SubscriptionChannel.TASK, userId, 'DeleteTaskPayload', data, subOptions)
    }
  })
  return data
}

export default deleteTask
