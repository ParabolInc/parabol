import type {DataLoaderWorker} from '../../graphql/graphql'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../../utils/Logger'
import detectServicesForUser, {isDetectionEnabled} from './detectServicesForUser'

// Small enough that a backfill trickles out to vendors instead of arriving as a burst
const CONCURRENCY = 5

interface BackfillOptions {
  lastSeenAfter: Date
  limit: number
  retryInconclusive?: boolean
  dataLoader: DataLoaderWorker
}

/**
 * Run detection for a batch of existing users. Shared by the private mutation and the operator
 * script so the selection rule lives in exactly one place.
 *
 * Returns the number of users processed. Zero means the window is drained, which is what makes
 * "re-run until it returns 0" a correct stopping rule.
 */
const backfillSuggestedServices = async ({
  lastSeenAfter,
  limit,
  retryInconclusive = false,
  dataLoader
}: BackfillOptions) => {
  if (!isDetectionEnabled()) {
    Logger.warn('backfillSuggestedServices: SUGGESTED_SERVICES_ENABLED is not true, skipping')
    return 0
  }
  const pg = getKysely()

  // Selecting only users who still have work to do is what lets this be re-run to completion.
  // Without it every call would reprocess the same first `limit` users and never advance.
  const users = await pg
    .selectFrom('User')
    .select(['id', 'email'])
    .where('lastSeenAt', '>=', lastSeenAfter)
    .where(({exists, not, selectFrom, or}) => {
      const emailProbes = selectFrom('IntegrationAccountProbe as p')
        .select('p.id')
        .whereRef('p.subject', '=', 'User.email')
        .where('p.subjectType', '=', 'email')
      if (!retryInconclusive) {
        // Having any email-subject row means this user has already been through detection.
        // Domain rows are deliberately not consulted: a colleague's signup may have written
        // them before this user was ever looked up.
        return not(exists(emailProbes))
      }
      // On a retry, a stale domain lookup counts too — an inconclusive Atlassian probe for the
      // company is worth re-running even when every one of this user's email lookups succeeded
      const inconclusiveEmail = emailProbes.where('p.verdict', '=', 'inconclusive')
      const inconclusiveDomain = selectFrom('IntegrationAccountProbe as p')
        .select('p.id')
        .where('p.verdict', '=', 'inconclusive')
        .where('p.subjectType', '=', 'domain')
        .whereRef('p.subject', '=', 'User.domain')
      return or([exists(inconclusiveEmail), exists(inconclusiveDomain)])
    })
    .orderBy('lastSeenAt', 'desc')
    .limit(limit)
    .execute()

  for (let i = 0; i < users.length; i += CONCURRENCY) {
    const batch = users.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map(({id, email}) => detectServicesForUser(id, email, dataLoader, {retryInconclusive}))
    )
    results.forEach((result) => {
      if (result.status === 'rejected') {
        Logger.error('backfillSuggestedServices: user failed', result.reason)
      }
    })
  }
  return users.length
}

export default backfillSuggestedServices
