const GitLabIssueId = {
  join: (webPath: string, gid: string) => `${webPath}::${gid}`,
  split: (id: string) => {
    const [webPath, gid] = id.split('::') as [string, string]
    const iid = webPath.split('/').slice(-1)[0]
    return {
      webPath,
      gid,
      iid
    }
  }
}

export default GitLabIssueId
