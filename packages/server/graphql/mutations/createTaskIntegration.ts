import {GraphQLID, GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateTaskIntegrationPayload from '../types/CreateTaskIntegrationPayload'
import IntegrationProviderServiceEnum, {
  IntegrationProviderServiceEnumType
} from '../types/IntegrationProviderServiceEnum'
import JiraTaskIntegrationManager from '../../integrations/JiraTaskIntegrationManager'
import GitHubTaskIntegrationManager from '../../integrations/GitHubTaskIntegrationManager'

type CreateTaskIntegrationMutationVariables = {
  integrationProviderService: IntegrationProviderServiceEnumType
  projectId: string
  taskId: string
}
export default {
  name: 'CreateTaskIntegration',
  type: CreateTaskIntegrationPayload,
  args: {
    integrationProviderService: {
      type: new GraphQLNonNull(IntegrationProviderServiceEnum),
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
    {integrationProviderService, projectId, taskId}: CreateTaskIntegrationMutationVariables,
    context: GQLContext,
    info: GraphQLResolveInfo
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context

    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const task = await r.table('Task').get(taskId).run()
    if (!task) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }
    const {teamId, meetingId, userId} = task
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

    const integrationManagerClass =
      integrationProviderService === 'jira'
        ? JiraTaskIntegrationManager
        : integrationProviderService === 'github'
        ? GitHubTaskIntegrationManager
        : undefined

    if (!integrationManagerClass) {
      return standardError(new Error('Integration provider is not supported'))
    }

    const authDataLoader = dataLoader.get(integrationManagerClass.authLoaderKey)
    const [viewerAuth, assigneeAuth, team, teamMembers] = await Promise.all([
      authDataLoader.load({teamId: teamId, userId: viewerId}),
      userId ? authDataLoader.load({teamId: teamId, userId}) : null,
      dataLoader.get('teams').load(teamId),
      dataLoader.get('teamMembersByTeamId').load(teamId)
    ])

    const auth = viewerAuth ?? assigneeAuth
    const accessUserId = viewerAuth ? viewerId : assigneeAuth ? userId : null
    const teamMember = teamMembers.find(({userId}) => userId === viewerId)

    if (!auth) {
      return standardError(new Error('No auth exists for a given task!'), {userId: viewerId})
    }

    if (!accessUserId) {
      return standardError(
        new Error(`Neither you nor the assignee has access to ${integrationManagerClass.title}`),
        {
          userId: viewerId
        }
      )
    }

    if (!teamMember) {
      return standardError(new Error('User is not member of the team'), {
        userId: viewerId,
        tags: {teamId}
      })
    }

    const {preferredName: viewerName} = teamMember
    const {preferredName: assigneeName = ''} =
      (userId && teamMembers.find((user) => user.userId === userId)) || {}

    const integrationManager = new integrationManagerClass(task, team, accessUserId, context, info)

    const res = await integrationManager.createRemoteTaskAndUpdateDB(
      auth,
      projectId,
      viewerName,
      assigneeName
    )

    if (res.error) {
      return {error: {message: res.error.message}}
    }

    await r
      .table('Task')
      .get(taskId)
      .update({
        ...res.integrationData,
        updatedAt: now
      })
      .run()

    const data = {taskId}
    teamMembers.forEach(({userId}) => {
      publish(SubscriptionChannel.TASK, userId, 'CreateTaskIntegrationPayload', data, subOptions)
    })

    segmentIo.track({
      userId: viewerId,
      event: integrationManagerClass.segmentEventName,
      properties: {
        teamId,
        meetingId
      }
    })
    return data
  }
}
