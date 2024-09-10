import getKysely from '../../../postgres/getKysely'
import {QueryResolvers} from '../resolverTypes'

const suOrgCount: QueryResolvers['suOrgCount'] = async (_source, {minOrgSize, tier}) => {
  const pg = getKysely()
  const result = await pg
    .with('BigOrgs', (qb) =>
      qb
        .selectFrom('OrganizationUser')
        .select(({fn}) => fn.count('id').as('orgSize'))
        .where('tier', '=', tier)
        .where('inactive', '=', false)
        .where('removedAt', 'is', null)
        .groupBy('orgId')
        .having(({eb, fn}) => eb(fn.count('id'), '>=', minOrgSize))
    )
    .selectFrom('BigOrgs')
    .select(({fn}) => fn.count<number>('orgSize').as('count'))
    .executeTakeFirstOrThrow()
  return result.count
}

export default suOrgCount
