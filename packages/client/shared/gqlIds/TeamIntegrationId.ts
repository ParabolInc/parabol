const TeamIntegrationId = {
  join: (service: string, teamId: string, userId: string) =>
    `teamIntegration:${service}:${teamId}:${userId}`
}

export default TeamIntegrationId
