import {GraphQLID, GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import makeAppURL from '~/utils/makeAppURL'
import appOrigin from '../../appOrigin'
import TaskIntegrationManagerFactory from '../../integrations/TaskIntegrationManagerFactory'
import updatePrevUsedRepoIntegrationsCache from '../../integrations/updatePrevUsedRepoIntegrationsCache'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import sendToSentry from '../../utils/sendToSentry'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import CreateTaskIntegrationPayload from '../types/CreateTaskIntegrationPayload'
import IntegrationProviderServiceEnum, {
  IntegrationProviderServiceEnumType
} from '../types/IntegrationProviderServiceEnum'

type CreateTaskIntegrationMutationVariables = {
  integrationProviderService: IntegrationProviderServiceEnumType
  integrationRepoId: string
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
    integrationRepoId: {
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
    {integrationProviderService, integrationRepoId, taskId}: CreateTaskIntegrationMutationVariables,
    context: GQLContext,
    info: GraphQLResolveInfo
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const task = await dataLoader.get('tasks').load(taskId)
    if (!task) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }
    const {content: rawContentJSON, teamId, userId} = task
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

    const [viewerTaskManager, assigneeTaskManager, team, teamMembers, viewer, assigneeUser] =
      await Promise.all([
        TaskIntegrationManagerFactory.initManager(
          dataLoader,
          integrationProviderService,
          {
            teamId: teamId,
            userId: viewerId
          },
          context,
          info
        ),
        userId
          ? TaskIntegrationManagerFactory.initManager(
              dataLoader,
              integrationProviderService,
              {
                teamId: teamId,
                userId
              },
              context,
              info
            )
          : null,
        dataLoader.get('teams').loadNonNull(teamId),
        dataLoader.get('teamMembersByTeamId').load(teamId),
        dataLoader.get('users').loadNonNull(viewerId),
        userId ? dataLoader.get('users').load(viewerId) : null
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

    const {preferredName: viewerName} = viewer
    const {preferredName: assigneeName = ''} = assigneeUser || {}

    const teamDashboardUrl = makeAppURL(appOrigin, `team/${teamId}`)
    const createTaskResponse = await taskIntegrationManager.createTask({
      rawContentJSON: JSON.parse(rawContentJSON),
      integrationRepoId
    })

    if (createTaskResponse instanceof Error) {
      return {error: {message: createTaskResponse.message}}
    }

    const {issueId, ...updateTaskInput} = createTaskResponse

    if (userId && viewerId !== userId) {
      const addCommentResponse = await taskIntegrationManager.addCreatedBySomeoneElseComment(
        viewerName,
        assigneeName,
        team.name,
        teamDashboardUrl,
        issueId,
        updateTaskInput.integrationHash
      )

      if (addCommentResponse instanceof Error) {
        sendToSentry(addCommentResponse)
      }
    }

    updatePrevUsedRepoIntegrationsCache(teamId, integrationRepoId, viewerId)
    await pg
      .updateTable('Task')
      .set({
        integration: JSON.stringify(updateTaskInput.integration),
        integrationHash: updateTaskInput.integrationHash
      })
      .where('id', '=', taskId)
      .execute()

    dataLoader.clearAll('tasks')
    const data = {taskId}
    teamMembers.forEach(({userId}) => {
      publish(SubscriptionChannel.TASK, userId, 'CreateTaskIntegrationPayload', data, subOptions)
    })

    return data
  }
}
