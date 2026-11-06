const JiraProjectId = {
  join: (cloudId: string, projectKey: string) => `${cloudId}:${projectKey}`,
  split: (id: string) => {
    const firstColonIdx = id.indexOf(':')
    const cloudId = id.slice(0, firstColonIdx)
    const projectKey = id.slice(firstColonIdx + 1)
    return {cloudId, projectKey}
  }
}

export default JiraProjectId
