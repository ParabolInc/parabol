import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const setOrganizationDomain: MutationResolvers['setOrganizationDomain'] = async (
  _source,
  {orgId, domain},
  {dataLoader}
) => {
  const r = await getRethink()
  // VALIDATION
  const organization = await dataLoader.get('organizations').load(orgId)
  dataLoader.get('organizations').clear(orgId)
  if (!organization) {
    throw new Error('Organization not found')
  }

  // RESOLUTION
  await getKysely()
    .updateTable('Organization')
    .set({activeDomain: domain, isActiveDomainTouched: true})
    .where('id', '=', orgId)
    .execute()
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
