import {GraphQLError} from 'graphql'
import {getPrivateUsageKey} from '../../../license/instanceLicense'
import {makeUsageReport} from '../../../license/makeUsageReport'
import type {MutationResolvers} from '../resolverTypes'

const signUsageReport: MutationResolvers['signUsageReport'] = async () => {
  // VALIDATION
  const usage = getPrivateUsageKey()
  if (!usage.ok) {
    throw new GraphQLError(`This Parabol instance can’t sign usage reports: ${usage.error}`, {
      extensions: {code: 'FORBIDDEN'}
    })
  }

  // RESOLUTION
  return makeUsageReport()
}

export default signUsageReport
