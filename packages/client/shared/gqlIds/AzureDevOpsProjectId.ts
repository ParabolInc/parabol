const AzureDevOpsProjectId = {
  join: (instanceId: string, projectId: string) => `${instanceId}:${projectId}`,
  split: (repoIntegrationId: string) => {
    const [instanceId, projectId] = repoIntegrationId.split(':')
    return {instanceId, projectId} as {instanceId: string; projectId: string}
  }
}

export default AzureDevOpsProjectId
