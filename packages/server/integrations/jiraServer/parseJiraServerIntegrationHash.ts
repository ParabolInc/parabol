import JiraServerIssueId from 'parabol-client/shared/gqlIds/JiraServerIssueId'

const parseJiraServerIntegrationHash = (integrationHash: string) => {
  const {providerId, repositoryId, issueId} = JiraServerIssueId.split(integrationHash)
  if (
    Number.isNaN(providerId) ||
    !repositoryId ||
    !issueId ||
    JiraServerIssueId.join(providerId, repositoryId, issueId) !== integrationHash
  ) {
    return null
  }
  return {service: 'jiraServer' as const, providerId, repositoryId, issueId}
}

export default parseJiraServerIntegrationHash
