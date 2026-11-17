import {context, ROOT_CONTEXT} from '@opentelemetry/api'
import {getFeatureTier} from '../graphql/types/helpers/getFeatureTier'
import getKysely from '../postgres/getKysely'
import {getFeatureFlagsByScope} from './featureFlags'
import type {AccountLogContextLoader} from './Logger'
import {runWithoutLogContext} from './requestLogContext'

const MAX_ORGS = 10
const CACHE_TTL_MS = 60_000
const MAX_CACHED_ACCOUNTS = 500
// an error storm is often a database in trouble, so lookups stay few and stop for a while after one fails
const MAX_PENDING_LOOKUPS = 4
const LOOKUP_TIMEOUT_MS = 2000
const PAUSE_AFTER_FAILURE_MS = 30_000

const TIER_RANK = {starter: 0, team: 1, enterprise: 2} as const
type Tier = keyof typeof TIER_RANK

interface AccountLogContext {
  tier: Tier
  featureFlags: string[]
  orgs: {id: string; tier: Tier; featureFlags: string[]}[]
}

interface AccountSubject {
  userId?: string
  orgId?: string
}

const queryOrgs = ({userId, orgId}: AccountSubject) => {
  const orgQuery = getKysely()
    .selectFrom('Organization')
    .select(['id', 'tier', 'trialStartDate'])
    .orderBy('tier', 'desc')
    .limit(MAX_ORGS)
  if (!userId) return orgQuery.where('id', '=', orgId ?? '').execute()
  return orgQuery
    .where('id', 'in', (eb) =>
      eb
        .selectFrom('OrganizationUser')
        .select('orgId')
        .where('userId', '=', userId)
        .where('removedAt', 'is', null)
    )
    .execute()
}

const queryFeatureFlagOwners = (userId: string | undefined, orgIds: string[]) => {
  const activeFlagNames = getFeatureFlagsByScope('all').map(({featureName}) => featureName)
  if (activeFlagNames.length === 0 || (!userId && orgIds.length === 0)) return []
  return getKysely()
    .selectFrom('FeatureFlagOwner')
    .select(['featureName', 'orgId'])
    .where('featureName', 'in', activeFlagNames)
    .where((eb) =>
      eb.or([
        ...(orgIds.length > 0 ? [eb('orgId', 'in', orgIds)] : []),
        ...(userId
          ? [
              eb('userId', '=', userId),
              eb('teamId', 'in', (subquery) =>
                subquery
                  .selectFrom('TeamMember')
                  .select('teamId')
                  .where('userId', '=', userId)
                  .where('isNotRemoved', '=', true)
              )
            ]
          : [])
      ])
    )
    .execute()
}

const queryAccount = async (subject: AccountSubject): Promise<AccountLogContext> => {
  const orgRows = await queryOrgs(subject)
  const flagRows = await queryFeatureFlagOwners(
    subject.userId,
    orgRows.map(({id}) => id)
  )
  const orgs = orgRows.map(({id, tier, trialStartDate}) => ({
    id,
    tier: getFeatureTier({tier, trialStartDate}),
    featureFlags: flagRows.filter((flag) => flag.orgId === id).map(({featureName}) => featureName)
  }))
  const featureFlags = [
    ...new Set(flagRows.filter((flag) => !flag.orgId).map(({featureName}) => featureName))
  ]
  const tier = orgs.reduce<Tier>(
    (highestTier, org) => (TIER_RANK[org.tier] > TIER_RANK[highestTier] ? org.tier : highestTier),
    'starter'
  )
  return {tier, featureFlags, orgs}
}

interface CachedAccount {
  account: Promise<AccountLogContext | undefined>
  expiresAt: number
}

const accountCache = new Map<string, CachedAccount>()
let pendingLookupCount = 0
let pausedUntil = 0

const withTimeout = <T>(promise: Promise<T>) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Account lookup timed out')), LOOKUP_TIMEOUT_MS)
    promise.then(resolve, reject).finally(() => clearTimeout(timer))
  })

const lookUpAccount = async (subject: AccountSubject) => {
  pendingLookupCount++
  try {
    // outside the failed request, so its queries make no spans and its own errors carry no user to look up
    return await runWithoutLogContext(() =>
      context.with(ROOT_CONTEXT, () => withTimeout(queryAccount(subject)))
    )
  } catch {
    pausedUntil = Date.now() + PAUSE_AFTER_FAILURE_MS
    return undefined
  } finally {
    pendingLookupCount--
  }
}

const loadAccountLogContext: AccountLogContextLoader = async (subject) => {
  const key = `${subject.userId ?? ''}:${subject.orgId ?? ''}`
  const now = Date.now()
  const cached = accountCache.get(key)
  if (cached && cached.expiresAt > now) return cached.account
  if (now < pausedUntil || pendingLookupCount >= MAX_PENDING_LOOKUPS) return undefined
  const account = lookUpAccount(subject)
  accountCache.delete(key)
  accountCache.set(key, {account, expiresAt: now + CACHE_TTL_MS})
  if (accountCache.size > MAX_CACHED_ACCOUNTS) {
    accountCache.delete(accountCache.keys().next().value!)
  }
  return account
}

export default loadAccountLogContext
