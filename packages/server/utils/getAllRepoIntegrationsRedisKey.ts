const getAllRepoIntegrationsRedisKey = (teamId: string, viewerId: string) =>
  `allRepoIntegrations:${teamId}:${viewerId}`

export default getAllRepoIntegrationsRedisKey
