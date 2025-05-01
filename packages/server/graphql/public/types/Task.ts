import AzureDevOpsIssueId from 'parabol-client/shared/gqlIds/AzureDevOpsIssueId'
import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import GitHubRepoId from '../../../../client/shared/gqlIds/GitHubRepoId'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'
import LinearServerManager from '../../../integrations/linear/LinearServerManager'
import {IGetLatestTaskEstimatesQueryResult} from '../../../postgres/queries/generated/getLatestTaskEstimatesQuery'
import getSimilarTaskEstimate from '../../../postgres/queries/getSimilarTaskEstimate'
import insertTaskEstimate from '../../../postgres/queries/insertTaskEstimate'
import {GetIssueLabelsQuery, GetIssueLabelsQueryVariables} from '../../../types/githubTypes'
import {getUserId} from '../../../utils/authorization'
import getGitHubRequest from '../../../utils/getGitHubRequest'
import getIssueLabels from '../../../utils/githubQueries/getIssueLabels.graphql'
import sendToSentry from '../../../utils/sendToSentry'
import isValid from '../../isValid'
import {ReqResolvers} from './ReqResolvers'

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
      await dataLoader
        .get('jiraIssue')
        .load({teamId, userId: accessUserId, cloudId, issueKey, taskId, viewerId})
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
          sendToSentry(labelsError, {userId: accessUserId})
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
          const similarEstimate = await getSimilarTaskEstimate(
            taskIds,
            dimensionName,
            ghIssueLabels
          )
          if (!similarEstimate) return
          dataLoader.get('latestTaskEstimates').clear(taskId)
          return insertTaskEstimate({
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
        })
      )
    }
    return dataLoader.get('latestTaskEstimates').load(taskId)
  },

  editors: () => [],

  integration: async ({integration, integrationHash, teamId, id: taskId}, _args, context, info) => {
    const {dataLoader, authToken} = context
    const viewerId = getUserId(authToken)
    if (!integration) return null
    const {accessUserId} = integration
    if (integration.service === 'jira') {
      const {cloudId, issueKey} = integration
      return dataLoader
        .get('jiraIssue')
        .load({teamId, userId: accessUserId, cloudId, issueKey, taskId, viewerId})
    } else if (integration.service === 'jiraServer') {
      const {issueId} = JiraServerIssueId.split(integrationHash!)
      const issue = await dataLoader.get('jiraServerIssue').load({
        teamId,
        userId: accessUserId,
        issueId,
        providerId: integration.providerId
      })
      return issue
        ? {
            ...issue,
            userId: accessUserId,
            teamId
          }
        : null
    } else if (integration.service === 'azureDevOps') {
      const {projectKey, issueKey} = integration
      const {instanceId} = AzureDevOpsIssueId.split(integrationHash!)
      return dataLoader.get('azureDevOpsWorkItem').load({
        teamId,
        userId: accessUserId,
        instanceId,
        projectId: projectKey,
        viewerId,
        workItemId: issueKey
      })
    } else if (integration.service === 'github') {
      const githubAuth = await dataLoader.get('githubAuth').load({userId: accessUserId, teamId})
      if (!githubAuth) return null
      const {accessToken} = githubAuth
      const {nameWithOwner, issueNumber} = integration
      const {repoOwner, repoName} = GitHubRepoId.split(nameWithOwner)
      const query = `
              {
                repository(owner: "${repoOwner}", name: "${repoName}") {
                  issue(number: ${issueNumber}) {
                    ...info
                  }
                }
              }`
      const githubRequest = getGitHubRequest(info, context, {accessToken})
      const [data, error] = await githubRequest(query)
      if (error) {
        sendToSentry(error, {userId: accessUserId})
      }
      return data
    } else if (integration.service === 'gitlab') {
      const {accessUserId} = integration
      const gitlabAuth = await dataLoader
        .get('freshGitlabAuth')
        .load({teamId, userId: accessUserId})
      if (!gitlabAuth?.accessToken) return null
      const {providerId} = gitlabAuth
      const provider = await dataLoader.get('integrationProviders').load(providerId)
      if (!provider?.serverBaseUrl) return null
      const {gid} = integration
      const query = `
          query {
            issue(id: "${gid}"){
              ...info
            }
          }
        `
      const manager = new GitLabServerManager(gitlabAuth, context, info, provider.serverBaseUrl)
      const gitlabRequest = manager.getGitLabRequest(info, context)
      const [data, error] = await gitlabRequest(query, {})
      if (error) {
        sendToSentry(error, {userId: accessUserId})
      }
      return data
    } else if (integration.service === 'linear') {
      const {accessUserId} = integration
      const linearAuth = await dataLoader
        .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
        .load({service: 'linear', teamId, userId: accessUserId})
      if (!linearAuth?.accessToken) return null
      const {issueId} = integration
      const query = `
          query {
            issue(id: "${issueId}"){
              ...info
            }
          }
        `
      const manager = new LinearServerManager(linearAuth, context, info)
      const linearRequest = manager.getLinearRequest(info, context)
      const [data, error] = await linearRequest(query, {})
      if (error) {
        sendToSentry(error, {userId: accessUserId})
      }
      // Ensure the returned object has a standard prototype
      return data ? {...data} : null
    }
    return null
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
