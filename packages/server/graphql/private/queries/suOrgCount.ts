import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import {QueryResolvers} from '../resolverTypes'

const suOrgCount: QueryResolvers['suOrgCount'] = async (_source, {minOrgSize, tier}) => {
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
