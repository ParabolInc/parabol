const JiraServerIssueId = {
  join: (providerId: number, repositoryId: string, issueId: string) =>
    `${providerId}:${repositoryId}:${issueId}`,
  split: (id: string) => {
    const parts = id.split(':')
    // Assume the input is valid
    return {providerId: parseInt(parts[0]!, 10), repositoryId: parts[1]!, issueId: parts[2]!}
  }
}

export default JiraServerIssueId
