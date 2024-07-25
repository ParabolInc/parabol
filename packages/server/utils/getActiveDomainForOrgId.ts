import {DataLoaderInstance} from '../dataloader/RootDataLoader'
import getKysely from '../postgres/getKysely'
/**
 * Most used company domain for a given orgId
 */

const getActiveDomainForOrgId = async (orgId: string, dataLoader: DataLoaderInstance) => {
  const pg = getKysely()
  const orgUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  const userIds = orgUsers.map(({userId}) => userId)

  const activeDomain = await pg
    .selectFrom('User')
    .leftJoin('FreemailDomain', 'User.domain', 'FreemailDomain.domain')
    .select(({fn}) => ['User.domain as domain', fn.count('id').as('total')])
    .where('User.id', 'in', userIds)
    .where('FreemailDomain.domain', 'is', null)
    .groupBy('User.domain')
    .orderBy('total', 'desc')
    .limit(1)
    .executeTakeFirst()
  return activeDomain?.domain
}

export default getActiveDomainForOrgId
