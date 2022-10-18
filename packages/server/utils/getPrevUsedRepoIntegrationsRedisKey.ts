const getPrevUsedRepoIntegrationsRedisKey = (teamId: string, viewerId: string) =>
  `prevUsedRepoIntegrations:${teamId}:${viewerId}`

export default getPrevUsedRepoIntegrationsRedisKey
