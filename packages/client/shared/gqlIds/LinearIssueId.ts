// repoId is Linear's teamId:projectId or just teamId
const LinearIssueId = {
  join: (repoId: string, issueId: string) => `${repoId}::${issueId}`,
  split: (integrationHash: string) => {
    const [repoId, issueId] = integrationHash.split('::') as [string, string]
    return {
      issueId,
      repoId
    }
  }
}

export default LinearIssueId
