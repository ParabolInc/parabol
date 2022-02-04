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
import makeAppURL from '~/utils/makeAppURL'
import appOrigin from '../../appOrigin'
import TaskIntegrationManagerFactory from '../../integrations/TaskIntegrationManagerFactory'

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
    const {content: rawContentStr, teamId, meetingId, userId} = task
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

    const [viewerTaskManager, assigneeTaskManager, team, teamMembers] = await Promise.all([
      TaskIntegrationManagerFactory.initManager(dataLoader, integrationProviderService, {
        teamId: teamId,
        userId: viewerId
      }),
      userId
        ? TaskIntegrationManagerFactory.initManager(dataLoader, integrationProviderService, {
            teamId: teamId,
            userId
          })
        : null,
      dataLoader.get('teams').load(teamId),
      dataLoader.get('teamMembersByTeamId').load(teamId)
    ])

    const taskIntegrationManager = viewerTaskManager ?? assigneeTaskManager
    const accessUserId = viewerTaskManager ? viewerId : assigneeTaskManager ? userId : null
    const teamMember = teamMembers.find(({userId}) => userId === viewerId)

    if (!taskIntegrationManager) {
      return standardError(new Error('No auth exists for a given task!'), {userId: viewerId})
    }

    if (!accessUserId) {
      return standardError(
        new Error(`Neither you nor the assignee has access to ${taskIntegrationManager.title}`),
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

    const teamDashboardUrl = makeAppURL(appOrigin, `team/${teamId}`)
    const createdBySomeoneElseComment =
      userId && viewerId !== userId
        ? taskIntegrationManager.getCreatedBySomeoneElseComment(
            viewerName,
            assigneeName,
            team.name,
            teamDashboardUrl
          )
        : undefined

    const {error, integrationData} = await taskIntegrationManager.createTask({
      accessUserId,
      rawContentStr,
      projectId,
      createdBySomeoneElseComment,
      context,
      info
    })

    if (error) {
      return {error: {message: error.message}}
    }

    await r
      .table('Task')
      .get(taskId)
      .update({
        ...integrationData,
        updatedAt: now
      })
      .run()

    const data = {taskId}
    teamMembers.forEach(({userId}) => {
      publish(SubscriptionChannel.TASK, userId, 'CreateTaskIntegrationPayload', data, subOptions)
    })

    segmentIo.track({
      userId: viewerId,
      event: `Published Task to ${taskIntegrationManager.title}`,
      properties: {
        teamId,
        meetingId
      }
    })
    return data
  }
}
