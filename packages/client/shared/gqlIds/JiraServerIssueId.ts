const JiraServerIssueId = {
  join: (providerId: number, integrationRepoId: string, issueId: string) => `${providerId}:${integrationRepoId}:${issueId}`,
  split: (id: string) => {
    const parts = id.split(':')
    return {providerId: parts[0], integrationRepoId: parts[1], issueId: parts[2]}
  }
}

export default JiraServerIssueId
