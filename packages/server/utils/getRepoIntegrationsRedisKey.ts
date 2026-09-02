import type {Integrationproviderserviceenum} from '../postgres/types/pg'

const getRepoIntegrationsRedisKey = (
  service: Integrationproviderserviceenum,
  teamId: string,
  userId: string
) => `repoIntegrations:${service}:${teamId}:${userId}`

export default getRepoIntegrationsRedisKey
