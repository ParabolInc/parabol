import {GraphQLID, GraphQLNonNull} from 'graphql'
import {isTeamMember} from '../../utils/authorization'
import type {GQLContext} from '../graphql'
import RefreshPokerEstimateIntegrationPayload from '../types/RefreshPokerEstimateIntegrationPayload'

const refreshPokerEstimateIntegration = {
  type: new GraphQLNonNull(RefreshPokerEstimateIntegrationPayload),
  description: 'Fetch the latest integration data for a poker estimate task',
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the task to refresh'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the poker meeting'
    }
  },
  resolve: async (
    _source: unknown,
    {taskId, meetingId}: {taskId: string; meetingId: string},
    {authToken, dataLoader}: GQLContext
  ) => {
    // AUTH
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    if (meeting.meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
    }
    const {endedAt, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }
    if (endedAt) {
      return {error: {message: 'Meeting has ended'}}
    }

    // RESOLUTION
    const task = await dataLoader.get('tasks').load(taskId)
    if (!task) {
      return {error: {message: 'Task not found'}}
    }
    if (task.teamId !== teamId) {
      return {error: {message: 'Task not on team'}}
    }

    // Integration data is always fetched fresh from external APIs
    // DataLoaders start empty each request, so data is automatically fresh
    return {task}
  }
}

export default refreshPokerEstimateIntegration
