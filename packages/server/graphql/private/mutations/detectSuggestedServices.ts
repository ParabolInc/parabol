import backfillSuggestedServices from '../../../integrations/probe/backfillSuggestedServices'
import type {MutationResolvers} from '../resolverTypes'

const detectSuggestedServices: MutationResolvers['detectSuggestedServices'] = (
  _source,
  {lastSeenAfter, limit, retryInconclusive},
  {dataLoader}
) =>
  backfillSuggestedServices({
    lastSeenAfter,
    limit,
    retryInconclusive: !!retryInconclusive,
    dataLoader
  })

export default detectSuggestedServices
