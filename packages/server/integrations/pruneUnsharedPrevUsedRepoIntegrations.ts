import getPrevUsedRepoIntegrations from '../graphql/queries/helpers/getPrevUsedRepoIntegrations'
import type {Integrationproviderserviceenum} from '../postgres/types/pg'
import getPrevUsedRepoIntegrationsRedisKey from '../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../utils/getRedis'
import logError from '../utils/logError'
import getRepoListCapability from './platform/getRepoListCapability'
import type RepoAccess from './platform/RepoAccess'

const prune = async (
  teamId: string,
  userId: string,
  service: Integrationproviderserviceenum,
  access: RepoAccess
) => {
  if (access.mode === 'all') return
  const prevUsedRepos = await getPrevUsedRepoIntegrations(teamId)
  const unsharedMembers =
    prevUsedRepos
      ?.filter(
        (repo) =>
          repo.service === service &&
          'userId' in repo &&
          repo.userId === userId &&
          !access.allows(getRepoListCapability(repo).integrationRepoId(repo))
      )
      .map((repo) => JSON.stringify(repo)) ?? []
  if (unsharedMembers.length === 0) return
  await getRedis().zrem(getPrevUsedRepoIntegrationsRedisKey(teamId), unsharedMembers)
}

/** Forgets the team's prev-used repos that came from this user's connection and that it no longer shares. Other members' entries stay */
const pruneUnsharedPrevUsedRepoIntegrations = async (
  teamId: string,
  userId: string,
  service: Integrationproviderserviceenum,
  access: RepoAccess
) => {
  try {
    await prune(teamId, userId, service, access)
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    logError(error, {userId, tags: {teamId, service}})
  }
}

export default pruneUnsharedPrevUsedRepoIntegrations
