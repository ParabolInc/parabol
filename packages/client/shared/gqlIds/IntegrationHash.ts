import {TaskIntegration, TaskServiceEnum} from '../../../server/database/types/Task'
import GitHubIssueId from './GitHubIssueId'
import GitLabIssueId from './GitLabIssueId'
import JiraIssueId from './JiraIssueId'
import JiraServerIssueId from './JiraServerIssueId'
import AzureDevOpsIssueId from './AzureDevOpsIssueId'

const IntegrationHash = {
  join: (integration: TaskIntegration) => {
    switch (integration.service) {
      case 'github':
        return GitHubIssueId.join(integration.nameWithOwner, integration.issueNumber)
      case 'jira':
        return JiraIssueId.join(integration.cloudId, integration.issueKey)
      case 'jiraServer':
        return JiraServerIssueId.join(integration.providerId, integration.repositoryId, integration.issueId)
      case 'gitlab':
        return GitLabIssueId.join(integration.providerId, integration.gid)
      case 'azureDevOps':
        return AzureDevOpsIssueId.join(integration.instanceId, integration.projectKey, integration.issueKey)
      default:
        return ''
    }
  },
  split: (service: TaskServiceEnum, integrationHash: string) => {
    if (service === 'github') {
      const {issueNumber, nameWithOwner} = GitHubIssueId.split(integrationHash)
      return {
        service,
        nameWithOwner,
        issueNumber
      }
    }
    if (service === 'jira') {
      const {cloudId, issueKey, projectKey} = JiraIssueId.split(integrationHash)
      return {
        service,
        cloudId,
        issueKey,
        projectKey
      }
    }
    if (service === 'jiraServer') {
      const {providerId, issueId, repositoryId} = JiraServerIssueId.split(integrationHash)
      return {
        service,
        providerId,
        issueId,
        repositoryId
      }
    }
    if (service === 'gitlab') {
      const {providerId, gid} = GitLabIssueId.split(integrationHash)
      return {
        service,
        providerId,
        gid
      }
    }
    if (service === 'azureDevOps') {
      const {instanceId, issueKey, projectKey} = AzureDevOpsIssueId.split(integrationHash)
      return {
        service,
        instanceId,
        issueKey,
        projectKey
      }
    }
    return null
  }
}

export default IntegrationHash
