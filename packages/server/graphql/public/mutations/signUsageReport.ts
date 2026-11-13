import {GraphQLError} from 'graphql'
import {getUsageKey} from '../../../license/instanceLicense'
import {makeUsageReport} from '../../../license/makeUsageReport'
import type {MutationResolvers} from '../resolverTypes'

const signUsageReport: MutationResolvers['signUsageReport'] = async () => {
  // VALIDATION
  const usage = getUsageKey()
  if (!usage.ok) {
    throw new GraphQLError(`This Parabol instance can’t sign usage reports: ${usage.error}`)
  }

  // RESOLUTION
  return makeUsageReport()
}

export default signUsageReport
