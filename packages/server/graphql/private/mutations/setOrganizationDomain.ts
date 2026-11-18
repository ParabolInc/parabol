import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const setOrganizationDomain: MutationResolvers['setOrganizationDomain'] = async (
  _source,
  {orgId, domain},
  {dataLoader}
) => {
  // VALIDATION
  const organization = await dataLoader.get('organizations').load(orgId)
  dataLoader.get('organizations').clear(orgId)
  if (!organization) {
    throw new GraphQLError('Organization not found', {extensions: {code: 'NOT_FOUND'}})
  }

  // RESOLUTION
  await getKysely()
    .updateTable('Organization')
    .set({activeDomain: domain, isActiveDomainTouched: true})
    .where('id', '=', orgId)
    .execute()

  return true
}

export default setOrganizationDomain
