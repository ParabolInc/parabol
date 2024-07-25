import {selectOrganizations} from '../../../dataloader/primaryKeyLoaderMakers'
import getKysely from '../../../postgres/getKysely'
import {QueryResolvers} from '../resolverTypes'

const suProOrgInfo: QueryResolvers['suProOrgInfo'] = async (_source, {includeInactive}) => {
  const pg = getKysely()
  const proOrgs = await selectOrganizations().where('tier', '=', 'team').execute()
  if (includeInactive || proOrgs.length === 0) return proOrgs

  const proOrgIds = proOrgs.map(({id}) => id)
  const pgResults = await pg
    .selectFrom('OrganizationUser')
    .select(['orgId', ({fn}) => fn.count<number>('id').as('orgSize')])
    // use ANY to support case where proOrgIds is empty array. Please use `in` after RethinkDB is gone
    .where('orgId', 'in', proOrgIds)
    .where('inactive', '=', false)
    .where('removedAt', 'is', null)
    .groupBy('orgId')
    .having(({eb, fn}) => eb(fn.count('id'), '>=', 1))
    .execute()

  const activeOrgIds = pgResults.map(({orgId}) => orgId)
  return proOrgs.filter((org) => activeOrgIds.includes(org.id))
}

export default suProOrgInfo
