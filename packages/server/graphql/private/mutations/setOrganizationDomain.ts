import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'

const setOrganizationDomain: MutationResolvers['setOrganizationDomain'] = async (
  _source,
  {orgId, domain}
) => {
  const r = await getRethink()
  // VALIDATION
  const organization = await r.table('Organization').get(orgId).run()

  if (!organization) {
    throw new Error('Organization not found')
  }

  // RESOLUTION
  await r
    .table('Organization')
    .get(orgId)
    .update({
      activeDomain: domain,
      isActiveDomainTouched: true
    })
    .run()
  return true
}

export default setOrganizationDomain
