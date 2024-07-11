import getRethink from '../../../database/rethinkDriver'
import {RDatum} from '../../../database/stricterR'
import {selectOrganizations} from '../../../dataloader/primaryKeyLoaderMakers'
import {QueryResolvers} from '../resolverTypes'

const suProOrgInfo: QueryResolvers['suProOrgInfo'] = async (_source, {includeInactive}) => {
  const r = await getRethink()
  const proOrgs = await selectOrganizations().where('tier', '=', 'team').execute()
  if (includeInactive) return proOrgs

  const proOrgIds = proOrgs.map(({id}) => id)
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

  return proOrgs.filter((org) => activeOrgIds.includes(org.id))
}

export default suProOrgInfo
