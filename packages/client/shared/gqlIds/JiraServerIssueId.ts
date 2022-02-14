const JiraServerIssueId = {
  join: (providerId: number, integrationRepoId: string, issueId: string) => `${providerId}:${integrationRepoId}:${issueId}`,
}

export default JiraServerIssueId
