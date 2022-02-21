import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import SetTaskHighlightPayload from '../types/SetTaskHighlightPayload'

export default {
  description: 'Broadcast that the viewer highlights a task',
  type: SetTaskHighlightPayload,
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isHighlighted: {
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  },
  async resolve(
    _source: unknown,
    {
      taskId,
      meetingId,
      isHighlighted
    }: {taskId: string; meetingId: string; isHighlighted?: boolean},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const task = await dataLoader.get('tasks').load(taskId)
    if (!task) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }
    if (task.userId !== viewerId) {
      return standardError(new Error('Not your turn'), {userId: viewerId})
    }
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      return standardError(new Error('Meeting not found'), {userId: viewerId})
    }

    // RESOLUTION
    const data = {
      meetingId,
      taskId,
      isHighlighted
    }
    publish(SubscriptionChannel.MEETING, meetingId, 'SetTaskHighlightSuccess', data, subOptions)

    return data
  }
}
