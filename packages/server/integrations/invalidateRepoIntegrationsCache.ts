import getPrevUsedRepoIntegrations from '../graphql/queries/helpers/getPrevUsedRepoIntegrations'
import type {Integrationproviderserviceenum} from '../postgres/types/pg'
import getPrevUsedRepoIntegrationsRedisKey from '../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../utils/getRedis'
import getRepoIntegrationsRedisKey from '../utils/getRepoIntegrationsRedisKey'
import logError from '../utils/logError'

const invalidate = async (
  teamId: string,
  userId: string,
  service: Integrationproviderserviceenum,
  action: 'added' | 'removed'
) => {
  const redis = getRedis()
  await redis.del(getRepoIntegrationsRedisKey(service, teamId, userId))
  if (action === 'added') return
  const prevUsed = await getPrevUsedRepoIntegrations(teamId)
  const staleMembers =
    prevUsed?.filter((repo) => repo.service === service).map((repo) => JSON.stringify(repo)) ?? []
  if (staleMembers.length) {
    await redis.zrem(getPrevUsedRepoIntegrationsRedisKey(teamId), staleMembers)
  }
}

/** Drops the user's cached repo list for one service; on removal also forgets the team's prev-used repos for it */
const invalidateRepoIntegrationsCache = async (
  teamId: string,
  userId: string,
  service: Integrationproviderserviceenum,
  action: 'added' | 'removed'
) => {
  try {
    await invalidate(teamId, userId, service, action)
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    logError(error, {userId, tags: {teamId, service}})
  }
}

export default invalidateRepoIntegrationsCache
