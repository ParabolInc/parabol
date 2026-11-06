const AtlassianIntegratonId = {
  join: (teamId: string, userId: string) => `atlassiani:${teamId}:${userId}`,
  split: (id: string) => {
    const [, teamId, userId] = id.split(':')
    return {teamId, userId}
  }
}

export default AtlassianIntegratonId
