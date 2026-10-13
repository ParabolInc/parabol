import LinearIssueId from 'parabol-client/shared/gqlIds/LinearIssueId'

const parseLinearIntegrationHash = (integrationHash: string) => {
  const {repoId, issueId} = LinearIssueId.split(integrationHash)
  if (!repoId || !issueId || LinearIssueId.join(repoId, issueId) !== integrationHash) return null
  return {service: 'linear' as const, repoId, issueId}
}

export default parseLinearIntegrationHash
