import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import DeleteTaskPayload from '../types/DeleteTaskPayload'

export default {
  type: DeleteTaskPayload,
  description: 'Delete (not archive!) a task',
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The taskId to delete'
    }
  },
  async resolve(
    _source: unknown,
    {taskId}: {taskId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const task = await dataLoader.get('tasks').load(taskId)
    if (!task) {
      return {error: {message: 'Task not found'}}
    }
    const {teamId} = task
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

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
}
