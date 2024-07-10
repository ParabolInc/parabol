import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import getKysely from '../../../postgres/getKysely'
import {QueryResolvers} from '../resolverTypes'

const suOrgCount: QueryResolvers['suOrgCount'] = async (_source, {minOrgSize, tier}) => {
  const pg = getKysely()
  const pgResults = await pg
    .selectFrom('OrganizationUser')
    .select(({fn}) => fn.count('id').as('orgSize'))
    .where('tier', '=', tier)
    .where('inactive', '=', false)
    .where('removedAt', 'is', null)
    .groupBy('orgId')
    .having(({eb, fn}) => eb(fn.count('id'), '>=', minOrgSize))
    .execute()

  // TEST in Phase 2!
  console.log(pgResults)

  const r = await getRethink()
  return (
    r
      .table('OrganizationUser')
      .getAll(
        [tier, false] as unknown as string, // super hacky type fix bc no fn overload is defined in the type file for this valid invocation
        {index: 'tierInactive'} as unknown as undefined
      )
      .filter({removedAt: null})
      .group('orgId') as any
  )
    .count()
    .ungroup()
    .filter((group: RValue) => group('reduction').ge(minOrgSize))
    .count()
    .run()
}

export default suOrgCount
