const ClickUpIssueId = {
  join: (repoId: string, issueId: string) => `${repoId}::${issueId}`,
  split: (integrationHash: string) => {
    const [repoId, issueId] = integrationHash.split('::')
    return {repoId, issueId}
  }
}

export default ClickUpIssueId
