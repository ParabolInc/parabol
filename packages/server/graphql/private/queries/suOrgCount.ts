import getKysely from '../../../postgres/getKysely'
import {QueryResolvers} from '../resolverTypes'

const suOrgCount: QueryResolvers['suOrgCount'] = async (_source, {minOrgSize, tier}) => {
  const pg = getKysely()
  const result = await pg
    .with('BigOrgs', (qb) =>
      qb
        .selectFrom('Organization')
        .innerJoin('OrganizationUser as ou', 'Organization.id', 'ou.orgId')
        .select(({fn}) => fn.count('ou.id').as('orgSize'))
        .where('tier', '=', tier)
        .where('ou.inactive', '=', false)
        .where('ou.removedAt', 'is', null)
        .where(({eb, fn}) => eb(fn.count('ou.id'), '>=', minOrgSize))
    )
    .selectFrom('BigOrgs')
    .select(({fn}) => fn.count<number>('orgSize').as('count'))
    .executeTakeFirstOrThrow()
  return result.count
}

export default suOrgCount
