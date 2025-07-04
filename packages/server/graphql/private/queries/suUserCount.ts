import getKysely from '../../../postgres/getKysely'
import {QueryResolvers} from '../resolverTypes'

const suUserCount: QueryResolvers['suUserCount'] = async (_source, {tier}) => {
  const pg = getKysely()
  const result = await pg
    .selectFrom('OrganizationUser as ou')
    .innerJoin('Organization as o', 'o.id', 'ou.orgId')
    .innerJoin('User as u', 'ou.userId', 'u.id')
    .select(({fn}) => fn.count<number>('ou.userId').distinct().as('count'))
    .where('tier', '=', tier)
    .where('u.inactive', '=', false)
    .where('ou.removedAt', 'is', null)
    .executeTakeFirstOrThrow()
  return result.count
}

export default suUserCount
