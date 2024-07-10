import {sql} from 'kysely'
import getRethink from '../../../database/rethinkDriver'
import {RDatum} from '../../../database/stricterR'
import {selectOrganizations} from '../../../dataloader/primaryKeyLoaderMakers'
import getKysely from '../../../postgres/getKysely'
import {QueryResolvers} from '../resolverTypes'

const suProOrgInfo: QueryResolvers['suProOrgInfo'] = async (_source, {includeInactive}) => {
  const r = await getRethink()
  const pg = getKysely()
  const proOrgs = await selectOrganizations().where('tier', '=', 'team').execute()
  if (includeInactive) return proOrgs

  const proOrgIds = proOrgs.map(({id}) => id)
  const pgResults = await pg
    .selectFrom('OrganizationUser')
    .select(({fn}) => fn.count('id').as('orgSize'))
    // use ANY to support case where proOrgIds is empty array. Please use `in` after RethinkDB is gone
    .where('orgId', '=', sql<string>`ANY(${proOrgIds})`)
    .where('inactive', '=', false)
    .where('removedAt', 'is', null)
    .groupBy('orgId')
    .having(({eb, fn}) => eb(fn.count('id'), '>=', 1))
    .execute()

  const activeOrgIds = await (
    r
      .table('OrganizationUser')
      .getAll(r.args(proOrgIds), {index: 'orgId'})
      .filter({removedAt: null, inactive: false})
      .group('orgId') as RDatum
  )
    .count()
    .ungroup()
    .filter((row: RDatum) => row('reduction').ge(1))('group')
    .run()
  console.log({pgResults, activeOrgIds})
  return proOrgs.filter((org) => activeOrgIds.includes(org.id))
}

export default suProOrgInfo
