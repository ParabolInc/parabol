import ClickUpIssueId from 'parabol-client/integrations/clickup/shared/ClickUpIssueId'

const parseClickUpIntegrationHash = (integrationHash: string) => {
  const {repoId, issueId} = ClickUpIssueId.split(integrationHash)
  if (!repoId || !issueId || ClickUpIssueId.join(repoId, issueId) !== integrationHash) return null
  return {service: 'clickup' as const, repoId, issueId}
}

export default parseClickUpIntegrationHash
