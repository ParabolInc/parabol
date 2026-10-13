import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'

const parseJiraIntegrationHash = (integrationHash: string) => {
  const {cloudId, issueKey, projectKey} = JiraIssueId.split(integrationHash)
  if (!cloudId || !issueKey || JiraIssueId.join(cloudId, issueKey) !== integrationHash) return null
  return {service: 'jira' as const, cloudId, issueKey, projectKey}
}

export default parseJiraIntegrationHash
