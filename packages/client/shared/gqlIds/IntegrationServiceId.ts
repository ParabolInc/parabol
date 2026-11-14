const IntegrationServiceId = {
  join: (teamId: string, userId: string, service: string) =>
    `integrationService:${service}:${teamId}:${userId}`,
  split: (id: string) => {
    const [, service, teamId, ...userId] = id.split(':')
    return {service, teamId, userId: userId.join(':')}
  }
}

export default IntegrationServiceId
