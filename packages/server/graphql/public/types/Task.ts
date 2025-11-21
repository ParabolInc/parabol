import GitHubRepoId from '../../../../client/shared/gqlIds/GitHubRepoId'
import getKysely from '../../../postgres/getKysely'
import type {IGetLatestTaskEstimatesQueryResult} from '../../../postgres/queries/generated/getLatestTaskEstimatesQuery'
import {selectTaskEstimate} from '../../../postgres/select'
import type {GetIssueLabelsQuery, GetIssueLabelsQueryVariables} from '../../../types/githubTypes'
import {getUserId} from '../../../utils/authorization'
import getGitHubRequest from '../../../utils/getGitHubRequest'
import getIssueLabels from '../../../utils/githubQueries/getIssueLabels.graphql'
import logError from '../../../utils/logError'
import isValid from '../../isValid'
import {resolveTaskIntegration} from '../../resolvers/resolveTaskIntegration'
import type {ReqResolvers} from './ReqResolvers'

const Task: Omit<ReqResolvers<'Task'>, 'replies'> = {
  __isTypeOf: ({status}) => !!status,
  agendaItem: async ({discussionId}, _args, {dataLoader}) => {
    if (!discussionId) return null
    const discussion = await dataLoader.get('discussions').load(discussionId)
    if (!discussion) return null
    const {discussionTopicId, discussionTopicType} = discussion
    if (discussionTopicType !== 'agendaItem') return null
    return dataLoader.get('agendaItems').loadNonNull(discussionTopicId)
  },

  taskService: ({integration}, _args) => {
    return integration?.service ?? null
  },

  createdByUser: ({createdBy}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(createdBy)
  },

  estimates: async ({id: taskId, integration, teamId}, _args, context, info) => {
    const {dataLoader, authToken} = context
    const viewerId = getUserId(authToken)
    if (integration?.service === 'jira') {
      const {accessUserId, cloudId, issueKey} = integration
      // this dataloader has the side effect of guaranteeing fresh estimates
      await dataLoader.get('jiraIssue').load({
        teamId,
        userId: accessUserId,
        cloudId,
        issueKey,
        taskId,
        viewerId
      })
    } else if (integration?.service === 'azureDevOps') {
      const {accessUserId, instanceId, projectKey, issueKey} = integration
      await dataLoader.get('azureDevOpsWorkItem').load({
        teamId,
        userId: accessUserId,
        instanceId,
        workItemId: issueKey,
        taskId,
        projectId: projectKey,
        viewerId
      })
    } else if (integration?.service === 'github') {
      const {accessUserId, nameWithOwner, issueNumber} = integration
      const [githubAuth, estimates] = await Promise.all([
        dataLoader.get('githubAuth').load({userId: accessUserId, teamId}),
        dataLoader.get('latestTaskEstimates').load(taskId)
      ])
      if (estimates.length === 0) return estimates
      // TODO schedule this work to be done & pump in the updates via subcription
      if (!githubAuth) return estimates
      // fetch fresh estimates from GH
      const {accessToken} = githubAuth
      const {repoOwner, repoName} = GitHubRepoId.split(nameWithOwner)
      const githubRequest = getGitHubRequest(info, context, {accessToken})
      const [labelsData, labelsError] = await githubRequest<
        GetIssueLabelsQuery,
        GetIssueLabelsQueryVariables
      >(getIssueLabels, {
        first: 100,
        repoName,
        repoOwner,
        issueNumber
      })
      if (!labelsData) {
        if (labelsError) {
          logError(labelsError, {userId: accessUserId})
        }
        return estimates
      }
      const labelNodes = labelsData.repository?.issue?.labels?.nodes
      if (!labelNodes) return estimates
      const ghIssueLabels = labelNodes.map((node) => node?.name).filter(isValid)
      await Promise.all(
        estimates.map(async (estimate: IGetLatestTaskEstimatesQueryResult) => {
          const {githubLabelName, name: dimensionName} = estimate
          const existingLabel = ghIssueLabels.includes(githubLabelName!)
          if (existingLabel) return
          // VERY EXPENSIVE. We do this only if we're darn sure we need to
          const taskIds = await dataLoader
            .get('taskIdsByTeamAndGitHubRepo')
            .load({teamId, nameWithOwner})
          const similarEstimate = await selectTaskEstimate()
            .where('taskId', 'in', taskIds)
            .where('name', '=', dimensionName)
            .where('githubLabelName', 'in', ghIssueLabels)
            .limit(1)
            .executeTakeFirst()
          if (!similarEstimate) return
          dataLoader.get('latestTaskEstimates').clear(taskId)
          return getKysely()
            .insertInto('TaskEstimate')
            .values({
              changeSource: 'external',
              // keep the link to the discussion alive, if possible
              discussionId: estimate.discussionId,
              jiraFieldId: undefined,
              label: similarEstimate.label,
              name: estimate.name,
              meetingId: null,
              stageId: null,
              taskId,
              userId: accessUserId,
              githubLabelName: similarEstimate.githubLabelName!
            })
            .execute()
        })
      )
    }
    return dataLoader.get('latestTaskEstimates').load(taskId)
  },

  editors: () => [],

  integration: async (source, _args, context, info) => {
    return resolveTaskIntegration(source, context, info)
  },

  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },

  title: ({plaintextContent}) => {
    const firstBreak = plaintextContent.trim().indexOf('\n')
    const endIndex = firstBreak > -1 ? firstBreak : plaintextContent.length
    return plaintextContent.slice(0, endIndex)
  },

  user: ({userId}, _args, {dataLoader}) => {
    if (!userId) return null
    return dataLoader.get('users').loadNonNull(userId)
  },

  isHighlighted: async ({id: taskId}, {meetingId}, {dataLoader}) => {
    if (!meetingId) return false
    const highlightedTaskId = await dataLoader.get('meetingHighlightedTaskId').load(meetingId)
    return taskId === highlightedTaskId
  }
}

export default Task
