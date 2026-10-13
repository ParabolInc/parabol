import GitHubIssueId from 'parabol-client/shared/gqlIds/GitHubIssueId'

const parseGitHubIntegrationHash = (integrationHash: string) => {
  const {nameWithOwner, issueNumber} = GitHubIssueId.split(integrationHash)
  if (!nameWithOwner || !Number.isInteger(issueNumber) || issueNumber < 1) return null
  return {service: 'github' as const, nameWithOwner, issueNumber}
}

export default parseGitHubIntegrationHash
