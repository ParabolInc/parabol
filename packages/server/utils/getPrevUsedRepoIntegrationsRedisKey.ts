const getPrevUsedRepoIntegrationsRedisKey = (teamId: string) =>
  `testa3-prevUsedRepoIntegrations:${teamId}`

export default getPrevUsedRepoIntegrationsRedisKey
