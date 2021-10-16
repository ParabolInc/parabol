const GitLabIntegrationId = {
  join: (teamId: string, userId: string) => `gli:${teamId}:${userId}`,
  split: (id: string) => {
    const [, teamId, userId] = id.split(':')
    return {teamId, userId}
  }
}

export default GitLabIntegrationId
