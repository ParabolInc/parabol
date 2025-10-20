import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import type {GQLContext} from '../graphql'
import RefreshPokerEstimateIntegrationPayload from '../types/RefreshPokerEstimateIntegrationPayload'

const refreshPokerEstimateIntegration = {
  type: new GraphQLNonNull(RefreshPokerEstimateIntegrationPayload),
  description: 'Refresh the integration data for a poker estimate task',
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
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

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

    const {integration} = task

    // Clear relevant DataLoader caches based on integration type
    if (integration) {
      const {service} = integration

      switch (service) {
        case 'jira': {
          const {cloudId, issueKey, accessUserId} = integration
          // Clear the jiraIssue cache for this specific issue
          dataLoader.get('jiraIssue').clear({
            teamId,
            userId: accessUserId,
            cloudId,
            issueKey,
            taskId,
            viewerId
          })
          break
        }
        case 'azureDevOps': {
          const {instanceId, projectKey, issueKey, accessUserId} = integration
          // Clear the azureDevOpsWorkItem cache for this specific work item
          dataLoader.get('azureDevOpsWorkItem').clear({
            teamId,
            userId: accessUserId,
            instanceId,
            projectId: projectKey,
            viewerId,
            workItemId: issueKey
          })
          break
        }
        // GitHub, GitLab, and Linear fetch directly - no cache to clear
        case 'github':
        case 'gitlab':
        case 'linear':
        case 'jiraServer':
          // These services don't use DataLoader caching or fetch fresh data each time
          break
        default:
          break
      }
    }

    // Clear latestTaskEstimates cache
    dataLoader.get('latestTaskEstimates').clearAll()

    // Clear and reload the task to force fresh data fetch
    dataLoader.get('tasks').clear(taskId)
    const refreshedTask = await dataLoader.get('tasks').load(taskId)

    if (!refreshedTask) {
      return {error: {message: 'Failed to reload task'}}
    }

    // Publish subscription update to meeting participants
    const data = {task: refreshedTask}
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'RefreshPokerEstimateIntegrationSuccess',
      data,
      subOptions
    )

    return data
  }
}

export default refreshPokerEstimateIntegration
