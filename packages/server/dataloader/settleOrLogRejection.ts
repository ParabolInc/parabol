import logError from '../utils/logError'

type TeamUserKey = {teamId: string; userId: string}

/** Auth loaders return null for a rejected key so one bad row can't fail the batch; the cause still needs a breadcrumb */
const settleOrLogRejection = <T>(
  results: PromiseSettledResult<T>[],
  keys: readonly TeamUserKey[]
) =>
  results.map((result, idx) => {
    if (result.status === 'fulfilled') return result.value
    const {teamId, userId} = keys[idx]!
    const error = result.reason instanceof Error ? result.reason : new Error(String(result.reason))
    logError(error, {userId, tags: {teamId}})
    return null
  })

export default settleOrLogRejection
