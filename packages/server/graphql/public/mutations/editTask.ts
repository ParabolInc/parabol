import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const editTask: MutationResolvers['editTask'] = async (
  _source,
  {taskId, isEditing},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const task = await dataLoader.get('tasks').load(taskId)
  if (!task) {
    return {error: {message: 'Task not found'}}
  }
  const viewerId = getUserId(authToken)
  const {tags, teamId, userId: taskUserId} = task
  // RESOLUTION
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const isPrivate = tags.includes('private')
  const data = {taskId, editorId: viewerId, isEditing}
  teamMembers.forEach((teamMember) => {
    const {userId} = teamMember
    if (!isPrivate || taskUserId === userId) {
      publish(SubscriptionChannel.TASK, userId, 'EditTaskPayload', data, subOptions)
    }
  })
  return data
}

export default editTask
