import {GraphQLError} from 'graphql'
import {isEnterpriseInstance} from '../../../license/instanceLicense'
import {getUsageKey} from '../../../license/licenseState'
import {makeUsageReport} from '../../../license/makeUsageReport'
import type {MutationResolvers} from '../resolverTypes'

const signUsageReport: MutationResolvers['signUsageReport'] = async () => {
  // VALIDATION
  // a license is for the whole instance, and Parabol's cloud has no usage reports
  if (!isEnterpriseInstance()) {
    throw new GraphQLError('Usage reports are for enterprise instances')
  }
  const usage = getUsageKey()
  if (!usage.ok) {
    throw new GraphQLError(`This Parabol instance can’t sign usage reports: ${usage.error}`)
  }

  // RESOLUTION
  return makeUsageReport()
}

export default signUsageReport
