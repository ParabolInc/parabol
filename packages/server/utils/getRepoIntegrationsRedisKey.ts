import type {Integrationproviderserviceenum} from '../postgres/types/pg'

const getRepoIntegrationsRedisKey = (
  service: Integrationproviderserviceenum,
  teamId: string,
  userId: string
) => `repoIntegrations:v2:${service}:${teamId}:${userId}`

export default getRepoIntegrationsRedisKey
