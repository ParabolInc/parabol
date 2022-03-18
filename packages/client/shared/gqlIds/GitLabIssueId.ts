const GitLabIssueId = {
  join: (providerId: string, gid: string) => `${providerId}::${gid}`,
  split: (id: string) => {
    const [providerId, gid] = id.split('::') as [string, string]
    return {
      providerId,
      gid
    }
  }
}

export default GitLabIssueId
