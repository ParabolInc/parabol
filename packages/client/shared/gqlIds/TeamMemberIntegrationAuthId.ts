const TeamMemberIntegrationAuthId = {
  join: (service: string, teamId: string, userId: string) => `${service}:${teamId}:${userId}`,
  split: (id: string) => {
    const [service, teamId, userId] = id.split(':')
    return {service, teamId, userId}
  }
}

export default TeamMemberIntegrationAuthId
