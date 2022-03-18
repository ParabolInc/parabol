import getRethink from '../../../database/rethinkDriver'
import {requireSU} from '../../../utils/authorization'
import {QueryResolvers} from '../resolverTypes'

const setOrganizationDomain: QueryResolvers['setOrganizationDomain'] = async (
  _source,
  {orgId, domain},
  {authToken}
) => {
  const r = await getRethink()

  // AUTH
  requireSU(authToken)

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
