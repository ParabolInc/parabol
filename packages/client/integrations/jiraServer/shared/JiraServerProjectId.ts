const JiraServerProjectId = {
  join: (providerId: number, projectId: string) => `${providerId}:${projectId}`,
  split: (id: string) => {
    const [providerId, projectId] = id.split(':') as [string, string]
    return {providerId: Number.parseInt(providerId, 10), projectId}
  }
}

export default JiraServerProjectId
