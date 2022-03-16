const AzureDevOpsProjectId = {
  join: (instanceId: string, projectKey: string) => `${instanceId}:${projectKey}`,
  split: (id: string) => {
    const firstColonIdx = id.indexOf(':')
    const instanceId = id.slice(0, firstColonIdx)
    const projectKey = id.slice(firstColonIdx + 1)
    return {instanceId, projectKey}
  }
}

export default AzureDevOpsProjectId
