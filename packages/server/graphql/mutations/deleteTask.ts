import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
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
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const task = await r.table('Task').get(taskId).run()
    if (!task) {
      return {error: {message: 'Task not found'}}
    }
    const {teamId} = task
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const {subscribedUserIds} = await r({
      task: r.table('Task').get(taskId).delete(),
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
        .coerceTo('array') as unknown as string[]
    }).run()
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
