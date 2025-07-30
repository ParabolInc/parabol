import getKysely from '../../../postgres/getKysely'
import type {QueryResolvers} from '../resolverTypes'

const suOrgCount: QueryResolvers['suOrgCount'] = async (_source, {minOrgSize, tier}) => {
  const pg = getKysely()
  const result = await pg
    .with('BigOrgs', (qb) =>
      qb
        .selectFrom('Organization as o')
        .innerJoin('OrganizationUser as ou', 'o.id', 'ou.orgId')
        .innerJoin('User as u', 'ou.userId', 'u.id')
        .select(({fn}) => fn.count('ou.id').as('orgSize'))
        .where('tier', '=', tier)
        .where('u.inactive', '=', false)
        .where('ou.removedAt', 'is', null)
        .groupBy('o.id')
        .having(({eb, fn}) => eb(fn.count('ou.id'), '>=', minOrgSize))
    )
    .selectFrom('BigOrgs')
    .select(({fn}) => fn.count<number>('orgSize').as('count'))
    .executeTakeFirstOrThrow()
  return result.count
}

export default suOrgCount
