import {GraphQLID, GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateTaskIntegrationPayload from '../types/CreateTaskIntegrationPayload'
import IntegrationProviderTypeEnum, {
  IntegrationProviderTypeEnumType
} from '../types/IntegrationProviderTypeEnum'
import JiraTaskIntegrationManager from '../../integrations/JiraTaskIntegrationManager'
import GitHubTaskIntegrationManager from '../../integrations/GitHubTaskIntegrationManager'

type CreateTaskIntegrationMutationVariables = {
  integrationProviderType: IntegrationProviderTypeEnumType
  projectId: string
  taskId: string
}
export default {
  name: 'CreateTaskIntegration',
  type: CreateTaskIntegrationPayload,
  args: {
    integrationProviderType: {
      type: new GraphQLNonNull(IntegrationProviderTypeEnum),
      description: 'Which integration to push the task to'
    },
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Jira projectId, GitHub nameWithOwner etc.'
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the task to convert to an issue'
    }
  },
  resolve: async (
    _source: unknown,
    {integrationProviderType, projectId, taskId}: CreateTaskIntegrationMutationVariables,
    context: GQLContext,
    info: GraphQLResolveInfo
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context

    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const task = await r.table('Task').get(taskId).run()
    if (!task) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }
    const {teamId, meetingId} = task
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    if (task.integration) {
      return standardError(
        new Error(`That task is already linked to ${task.integration.service}`),
        {userId: viewerId}
      )
    }

    const integrationManager =
      integrationProviderType === 'jira'
        ? new JiraTaskIntegrationManager(task, context, info)
        : integrationProviderType === 'github'
        ? new GitHubTaskIntegrationManager(task, context, info)
        : undefined

    if (!integrationManager) {
      return standardError(new Error('Integration provider is not supported'))
    }

    await integrationManager.init()

    if (!integrationManager.auth) {
      return standardError(new Error('No auth exists for a given task!'), {userId: viewerId})
    }

    if (!integrationManager.accessUserId) {
      return standardError(
        new Error(`Neither you nor the assignee has access to ${integrationManager.title}`),
        {
          userId: viewerId
        }
      )
    }

    if (!integrationManager.teamMember) {
      return standardError(new Error('User is not member of the team'), {
        userId: viewerId,
        tags: {teamId}
      })
    }

    const res = await integrationManager.createRemoteTaskAndUpdateDB(taskId, projectId)

    if (res.error) {
      return {error: {message: res.error.message}}
    }

    const data = {taskId}
    integrationManager.teamMembers.forEach(({userId}) => {
      publish(SubscriptionChannel.TASK, userId, 'CreateTaskIntegrationPayload', data, subOptions)
    })

    segmentIo.track({
      userId: viewerId,
      event: integrationManager.segmentEventName,
      properties: {
        teamId,
        meetingId
      }
    })
    return data
  }
}
