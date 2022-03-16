import {TaskIntegration, TaskServiceEnum} from '../../../server/database/types/Task'
import GitHubIssueId from './GitHubIssueId'
import JiraIssueId from './JiraIssueId'
import JiraServerIssueId from './JiraServerIssueId'

const IntegrationHash = {
  join: (integration: TaskIntegration) => {
    switch (integration.service) {
      case 'github':
        return GitHubIssueId.join(integration.nameWithOwner, integration.issueNumber)
      case 'jira':
        return JiraIssueId.join(integration.cloudId, integration.issueKey)
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
      const {providerId} = JiraServerIssueId.split(integrationHash)
      return {
        service,
        providerId
      }
    }

    return null
  }
}

export default IntegrationHash
