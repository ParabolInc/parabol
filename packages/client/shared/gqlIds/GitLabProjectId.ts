const GitLabProjectId = {
  join: (providerId: number, projectId: number) => `${providerId}:${projectId}`,
  split: (id: string) => {
    const [providerId, projectId] = id.split(':') as [string, string]
    return {providerId: Number.parseInt(providerId, 10), projectId: Number.parseInt(projectId, 10)}
  }
}

export default GitLabProjectId
