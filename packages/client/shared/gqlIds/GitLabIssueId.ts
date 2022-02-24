// This ID is unique to all of GitHub. Used as the Task.integrationHash
const GitLabIssueId = {
  join: (webPath: string, guid: string) => `${webPath}::${guid}`,
  split: (id: string) => {
    const [webPath, guid] = id.split('::')
    return {
      webPath,
      guid
    }
  }
}

export default GitLabIssueId
