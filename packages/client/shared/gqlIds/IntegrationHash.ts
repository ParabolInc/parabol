import {TaskIntegration, TaskServiceEnum} from '../../../server/database/types/Task'
import GitHubIssueId from './GitHubIssueId'
import GitLabIssueId from './GitLabIssueId'
import JiraIssueId from './JiraIssueId'

const IntegrationHash = {
  join: (integration: TaskIntegration) => {
    switch (integration.service) {
      case 'github':
        return GitHubIssueId.join(integration.nameWithOwner, integration.issueNumber)
      case 'jira':
        return JiraIssueId.join(integration.cloudId, integration.issueKey)
      case 'gitlab':
        return GitLabIssueId.join(integration.providerId, integration.gid)
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
    if (service === 'gitlab') {
      const {providerId, gid} = GitLabIssueId.split(integrationHash)
      return {
        service,
        providerId,
        gid
      }
    }
    return null
  }
}

export default IntegrationHash
