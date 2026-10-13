import type {DataLoaderWorker} from '../../graphql/graphql'
import getKysely from '../../postgres/getKysely'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import invalidateRepoIntegrationsCache from '../invalidateRepoIntegrationsCache'
import RepoAccess, {type RepoAccessGrant} from './RepoAccess'

/**
 * Renames the grants whose repo the service now lists under another name.
 * A grant is matched by id and never dropped: a repo missing from one listing may only be briefly unreachable
 */
const refreshRepoAccessNames = async (
  auth: TeamMemberIntegrationAuth,
  listedRepos: readonly RepoAccessGrant[],
  dataLoader: DataLoaderWorker
) => {
  const {id: authId, teamId, userId, service} = auth
  const grants = RepoAccess.fromMeta(auth.meta).repos
  const listedNames = new Map(listedRepos.map(({id, name}) => [id.toLowerCase(), name]))
  const renamedGrants = grants.map((grant) => ({
    ...grant,
    name: listedNames.get(grant.id.toLowerCase()) ?? grant.name
  }))
  if (renamedGrants.every(({name}, idx) => name === grants[idx]!.name)) return
  await getKysely()
    .updateTable('TeamMemberIntegrationAuth')
    .set({meta: JSON.stringify(new RepoAccess('selected', renamedGrants).toMeta())})
    .where('id', '=', authId)
    .execute()
  dataLoader.clearAll('teamMemberIntegrationAuths')
  await invalidateRepoIntegrationsCache(teamId, userId, service, 'added')
}

export default refreshRepoAccessNames
