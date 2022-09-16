import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getRedis from '../../utils/getRedis'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import SetTaskHighlightPayload from '../types/SetTaskHighlightPayload'

const HIGHLIGHT_TIMEOUT_SECONDS = 300

export default {
  description: 'Broadcast that the viewer highlights a task',
  type: new GraphQLNonNull(SetTaskHighlightPayload),
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
    {taskId, meetingId, isHighlighted}: {taskId: string; meetingId: string; isHighlighted: boolean},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const [task, meeting] = await Promise.all([
      dataLoader.get('tasks').load(taskId),
      dataLoader.get('newMeetings').load(meetingId)
    ])
    if (!task) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }
    if (task.userId !== viewerId) {
      return standardError(new Error('Not your turn'), {userId: viewerId})
    }
    if (!meeting) {
      return standardError(new Error('Meeting not found'), {userId: viewerId})
    }
    const {teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }

    const redis = getRedis()
    // When switching highlight from Task 'A' to 'B' we might get {taskId: 'B', isHighlighted: true}
    // before {taskId: 'A', isHighlighted: false}, thus we only unset the highlighted task if it matches
    if (isHighlighted) {
      redis.set(`meetingTaskHighlight:${meetingId}`, taskId, 'EX', HIGHLIGHT_TIMEOUT_SECONDS)
      dataLoader.get('meetingHighlightedTaskId').prime(meetingId, taskId)
    } else {
      const highlightChanged = await redis.eval(
        `local highlightedTask=redis.call('get',KEYS[1]);
        if highlightedTask == ARGV[1] then
          redis.call('del',KEYS[1])
          return 1
        else
          return 0
        end`,
        1,
        `meetingTaskHighlight:${meetingId}`,
        taskId
      )
      if (highlightChanged) {
        dataLoader.get('meetingHighlightedTaskId').prime(meetingId, null)
      }
    }

    // RESOLUTION
    const data = {
      meetingId,
      taskId
    }
    publish(SubscriptionChannel.MEETING, meetingId, 'SetTaskHighlightSuccess', data, subOptions)

    return data
  }
}
