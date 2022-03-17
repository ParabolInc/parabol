const JiraServerIssueId = {
  join: (providerId: number, repoId: string, issueId: string) => `${providerId}:${repoId}:${issueId}`,
  split: (id: string) => {
    const parts = id.split(':')
    // Assume the input is valid
    return {providerId: parseInt(parts[0]!, 10), repoId: parts[1]! , issueId: parts[2]!}
  }
}

export default JiraServerIssueId
