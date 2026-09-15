import {sql} from 'kysely'
import type {DataLoaderWorker} from '../../graphql/graphql'
import getKysely from '../../postgres/getKysely'
import getDomainFromEmail from '../../utils/getDomainFromEmail'
import {Logger} from '../../utils/Logger'
import RedisLock from '../../utils/RedisLock'
import type {AccountProber, ProbeResult} from './AccountProber'
import {proberRegistry} from './proberRegistry'

// a claim older than this belonged to a process that died before its finalizer ran
const STALE_CLAIM_MINUTES = 15
// how long to wait for a vendor's rate-limit slot before giving up on that lookup
const MAX_RATE_LIMIT_WAIT_MS = 60_000

interface DetectOptions {
  /** also re-run lookups that previously came back inconclusive (transient failures, missing creds) */
  retryInconclusive?: boolean
}

export const isDetectionEnabled = () => process.env.SUGGESTED_SERVICES_ENABLED === 'true'

/**
 * Claim one (subject, service) lookup, atomically. The unique constraint is the cross-process
 * guard: whichever node inserts first owns the lookup and everyone else skips it, so two people
 * signing up from the same company in the same second do not both probe the domain.
 *
 * The ON CONFLICT predicate is what lets a claim be taken over — a row left at 'running' by a
 * crashed process becomes claimable again after STALE_CLAIM_MINUTES, and 'error' rows are always
 * retryable. Rows that finished cleanly return nothing, which is how a completed lookup is
 * never repeated.
 */
const claimProbe = async (
  subject: string,
  prober: AccountProber,
  retryInconclusive: boolean
): Promise<number | null> => {
  const pg = getKysely()
  const staleBefore = sql<Date>`now() - interval '${sql.raw(String(STALE_CLAIM_MINUTES))} minutes'`
  const row = await pg
    .insertInto('IntegrationAccountProbe')
    .values({
      subject,
      subjectType: prober.subjectType,
      service: prober.service,
      status: 'running'
    })
    .onConflict((oc) =>
      oc
        .columns(['subject', 'subjectType', 'service'])
        .doUpdateSet({status: 'running'})
        .where(({eb, or, and}) =>
          or([
            eb('IntegrationAccountProbe.status', '=', 'error'),
            and([
              eb('IntegrationAccountProbe.status', '=', 'running'),
              eb('IntegrationAccountProbe.updatedAt', '<', staleBefore)
            ]),
            ...(retryInconclusive
              ? [eb('IntegrationAccountProbe.verdict', '=', 'inconclusive')]
              : [])
          ])
        )
    )
    .returning('id')
    .executeTakeFirst()
  return row?.id ?? null
}

const runProber = async (prober: AccountProber, subject: string): Promise<ProbeResult> => {
  if (!prober.isEnabled()) {
    return {verdict: 'inconclusive', evidence: {reason: 'prober not configured'}}
  }
  if (!prober.minIntervalMs) return prober.probe(subject)
  // Deliberately never unlocked: the lock's TTL *is* the spacing between calls, so letting it
  // expire on its own is what paces the fleet against the vendor's quota.
  const lock = new RedisLock(`probe:vendor:${prober.service}`, prober.minIntervalMs)
  try {
    await lock.lock(MAX_RATE_LIMIT_WAIT_MS)
  } catch {
    return {verdict: 'inconclusive', evidence: {reason: 'rate limit wait exceeded'}}
  }
  return prober.probe(subject)
}

/**
 * Run every outstanding lookup for one user and record the results.
 *
 * Shared by both call sites: the signup hook in bootstrapNewUser and the one-off backfill
 * mutation. Callers fire it detached — it performs outbound requests and must never be able to
 * fail or delay a signup.
 */
const detectServicesForUser = async (
  userId: string,
  email: string,
  dataLoader: DataLoaderWorker,
  options: DetectOptions = {}
) => {
  if (!isDetectionEnabled()) return 0
  const {retryInconclusive = false} = options
  const domain = getDomainFromEmail(email)
  // a freemail address says nothing about a company, so domain lookups would be pure noise
  const isCompanyDomain = domain ? await dataLoader.get('isCompanyDomain').load(domain) : false
  const pg = getKysely()

  const runs = proberRegistry.map(async (prober) => {
    const subject = prober.subjectType === 'email' ? email : domain
    if (!subject) return false
    if (prober.subjectType === 'domain' && !isCompanyDomain) return false

    const probeId = await claimProbe(subject, prober, retryInconclusive)
    // another node owns this lookup, or it already completed
    if (!probeId) return false

    let result: ProbeResult
    try {
      result = await runProber(prober, subject)
    } catch (e) {
      // A thrown prober is a bug, not an answer. Mark the row 'error' so it stays retryable
      // instead of poisoning the subject with a permanent negative.
      Logger.error(`probe ${prober.service} threw for user ${userId}`, e)
      await pg
        .updateTable('IntegrationAccountProbe')
        .set({
          status: 'error',
          error: (e instanceof Error ? e.message : String(e)).slice(0, 500)
        })
        .where('id', '=', probeId)
        .execute()
        .catch(Logger.error)
      return false
    }

    // The row must never be left at 'running' with no live job, so this write covers every
    // non-throwing path out of the prober.
    await pg
      .updateTable('IntegrationAccountProbe')
      .set({
        status: 'done',
        verdict: result.verdict,
        matchType: prober.matchType,
        evidence: JSON.stringify(result.evidence),
        error: null,
        detectedAt: new Date()
      })
      .where('id', '=', probeId)
      .execute()
    return result.verdict === 'found'
  })

  const settled = await Promise.allSettled(runs)
  settled.forEach((outcome) => {
    if (outcome.status === 'rejected') Logger.error('probe bookkeeping failed', outcome.reason)
  })
  return settled.filter((o) => o.status === 'fulfilled' && o.value).length
}

export default detectServicesForUser
