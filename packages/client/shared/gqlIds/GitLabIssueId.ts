// This ID is unique to all of GitHub. Used as the Task.integrationHash
const GitLabIssueId = {
  join: (webPath: string, gid: string) => `${webPath}::${gid}`,
  split: (id: string) => {
    const [webPath, gid] = id.split('::') as [string, string]
    return {
      webPath,
      gid
    }
  }
}

export default GitLabIssueId
