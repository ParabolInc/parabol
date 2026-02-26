import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import TaskIntegrationManagerFactory from '../../../integrations/TaskIntegrationManagerFactory'
import updatePrevUsedRepoIntegrationsCache from '../../../integrations/updatePrevUsedRepoIntegrationsCache'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import logError from '../../../utils/logError'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const createTaskIntegration: MutationResolvers['createTaskIntegration'] = async (
  _source,
  {integrationProviderService, integrationRepoId, taskId},
  context,
  info
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // AUTH
  const task = await dataLoader.get('tasks').load(taskId)
  if (!task) {
    return {error: {message: 'Task not found'}}
  }
  const {content: rawContentJSON, teamId, userId} = task
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: 'Team not found'}}
  }

  // VALIDATION
  if (task.integration) {
    return {
      error: {message: `That task is already linked to ${(task.integration as any).service}`}
    }
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
      userId ? dataLoader.get('users').load(userId) : null
    ])

  const taskIntegrationManager = viewerTaskManager ?? assigneeTaskManager
  const accessUserId = viewerTaskManager ? viewerId : assigneeTaskManager ? userId : null
  const teamMember = teamMembers.find(({userId}) => userId === viewerId)

  if (!taskIntegrationManager) {
    return {error: {message: 'No auth exists for a given task!'}}
  }

  if (!accessUserId) {
    return {
      error: {
        message: `Neither you nor the assignee has access to ${taskIntegrationManager.title}`
      }
    }
  }

  if (!teamMember) {
    return {error: {message: 'User is not member of the team'}}
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
      logError(addCommentResponse)
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

export default createTaskIntegration
