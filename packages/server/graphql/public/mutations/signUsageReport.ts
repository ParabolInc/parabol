import {GraphQLError} from 'graphql'
import {dependsOnLicense} from '../../../license/capTierByLicense'
import {getUsageKey} from '../../../license/licenseState'
import {makeUsageReport} from '../../../license/makeUsageReport'
import type {MutationResolvers} from '../resolverTypes'

const signUsageReport: MutationResolvers['signUsageReport'] = async (
  _source,
  {orgId},
  {dataLoader}
) => {
  // VALIDATION
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  if (!dependsOnLicense(organization)) {
    throw new GraphQLError(`${organization.name} doesn’t run on this instance’s license`)
  }
  const usage = getUsageKey()
  if (!usage.ok) {
    throw new GraphQLError(`This Parabol instance can’t sign usage reports: ${usage.error}`)
  }

  // RESOLUTION
  return makeUsageReport()
}

export default signUsageReport
