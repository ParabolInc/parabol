import getRethink from '../database/rethinkDriver'
import getKysely from '../postgres/getKysely'

/**
 * Most used company domain for a given orgId
 */
const getActiveDomainForOrgId = async (orgId: string) => {
  const r = await getRethink()
  const pg = getKysely()

  const userIds = await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})('userId')
    .run()

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
