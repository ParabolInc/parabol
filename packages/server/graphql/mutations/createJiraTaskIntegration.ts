import createJiraTask from './helpers/createJiraTask'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import JiraIssueId from '../../../client/shared/gqlIds/JiraIssueId'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateJiraTaskIntegrationPayload from '../types/CreateJiraTaskIntegrationPayload'

type CreateJiraTaskIntegrationMutationVariables = {
  cloudId: string
  taskId: string
  projectKey: string
}
export default {
  name: 'CreateJiraTaskIntegration',
  type: CreateJiraTaskIntegrationPayload,
  args: {
    cloudId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The atlassian cloudId for the site'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The atlassian key of the project to put the issue in'
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the task to convert to a Jira issue'
    }
  },
  resolve: async (
    _source: Record<string, unknown>,
    {cloudId, projectKey, taskId}: CreateJiraTaskIntegrationMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const task = await r
      .table('Task')
      .get(taskId)
      .run()
    if (!task) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }
    const {content: rawContentStr, teamId, userId, meetingId} = task
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    if (!userId) {
      // we should probably remove this constraint in the future
      return {error: {message: 'Task must have assignee before it can be integrated with Jira'}}
    }

    // VALIDATION
    if (task.integration) {
      return standardError(
        new Error(`That task is already linked to ${task.integration.service}`),
        {userId: viewerId}
      )
    }

    const viewerAuth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: viewerId})
    if (!viewerAuth) {
      return standardError(new Error('The assignee does not have access to Jira'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    const res = await createJiraTask(rawContentStr, cloudId, projectKey, viewerAuth)
    if (res.error) {
      return {error: {message: res.error.message}}
    }
    const {issueKey} = res
    await r
      .table('Task')
      .get(taskId)
      .update({
        integrationHash: JiraIssueId.join(cloudId, issueKey),
        integration: {
          accessUserId: viewerId,
          service: 'jira',
          cloudId,
          issueKey
        },
        updatedAt: now
      })
      .run()
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const data = {taskId}
    teamMembers.forEach(({userId}) => {
      publish(
        SubscriptionChannel.TASK,
        userId,
        'CreateJiraTaskIntegrationPayload',
        data,
        subOptions
      )
    })
    segmentIo.track({
      userId: viewerId,
      event: 'Published Task to Jira',
      properties: {
        teamId,
        meetingId
      }
    })
    return data
  }
}
