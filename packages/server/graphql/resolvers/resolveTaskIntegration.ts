import type {GraphQLResolveInfo} from 'graphql'
import AzureDevOpsIssueId from '../../../client/shared/gqlIds/AzureDevOpsIssueId'
import GitHubRepoId from '../../../client/shared/gqlIds/GitHubRepoId'
import JiraServerIssueId from '../../../client/shared/gqlIds/JiraServerIssueId'
import GitLabServerManager from '../../integrations/gitlab/GitLabServerManager'
import LinearServerManager from '../../integrations/linear/LinearServerManager'
import type {Task} from '../../postgres/types'
import {getUserId} from '../../utils/authorization'
import getGitHubRequest from '../../utils/getGitHubRequest'
import logError from '../../utils/logError'
import type {InternalContext} from '../graphql'

export const resolveTaskIntegration = async (
  {integration, integrationHash, teamId, id: taskId}: Task,
  context: InternalContext,
  info: GraphQLResolveInfo,
  fieldsToFetch = '...info'
) => {
  const {dataLoader, authToken} = context
  const viewerId = getUserId(authToken)
  if (!integration) return null
  const {accessUserId} = integration
  if (integration.service === 'jira') {
    const {cloudId, issueKey} = integration
    return dataLoader.get('jiraIssue').load({
      teamId,
      userId: accessUserId,
      cloudId,
      issueKey,
      taskId,
      viewerId
    })
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
                    ${fieldsToFetch}
                  }
                }
              }`

    const githubRequest = getGitHubRequest(info, context, {accessToken})
    const [data, error] = await githubRequest(query)

    if (error) {
      logError(error, {userId: accessUserId})
    }
    return data
  } else if (integration.service === 'gitlab') {
    const {accessUserId} = integration
    const gitlabAuth = await dataLoader.get('freshGitlabAuth').load({teamId, userId: accessUserId})
    if (!gitlabAuth?.accessToken) return null
    const {providerId} = gitlabAuth
    const provider = await dataLoader.get('integrationProviders').load(providerId)
    if (!provider?.serverBaseUrl) return null
    const {gid} = integration
    const query = `
          query {
            issue(id: "${gid}"){
              ${fieldsToFetch}
            }
          }
        `
    const manager = new GitLabServerManager(gitlabAuth, context, info, provider.serverBaseUrl)
    const gitlabRequest = manager.getGitLabRequest(info, context)
    const [data, error] = await gitlabRequest(query, {})
    if (error) {
      logError(error, {userId: accessUserId})
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
              ${fieldsToFetch}
            }
          }
        `
    const manager = new LinearServerManager(linearAuth, context, info)
    const linearRequest = manager.getLinearRequest(info, context)
    const [data, error] = await linearRequest(query, {})
    if (error) {
      logError(error, {userId: accessUserId})
    }
    // Ensure the returned object has a standard prototype
    return data ? {...data} : null
  }
  return null
}
