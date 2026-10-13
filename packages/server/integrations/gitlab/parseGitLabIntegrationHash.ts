import GitLabIssueId from 'parabol-client/shared/gqlIds/GitLabIssueId'

const parseGitLabIntegrationHash = (integrationHash: string) => {
  const {providerId, gid} = GitLabIssueId.split(integrationHash)
  if (!gid?.startsWith('gid://') || GitLabIssueId.join(providerId, gid) !== integrationHash) {
    return null
  }
  return {service: 'gitlab' as const, providerId, gid}
}

export default parseGitLabIntegrationHash
