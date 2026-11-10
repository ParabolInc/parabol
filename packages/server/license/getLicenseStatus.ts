import ms from 'ms'
import {
  type LicenseClaims,
  type LicensedTier,
  type LicenseParseResult,
  type LicenseStage,
  stageOffsetMs
} from './licenseToken'

/** How long an instance keeps its paid features after it's found without a valid license */
export const LICENSE_GRACE_MS = ms('30d')

export type LicenseState = 'valid' | 'expired' | 'missing' | 'invalid'
type CappedTier = 'team' | 'starter'

/** Where the instance is in one of its license's timelines */
export interface LicenseTimeline {
  /** The step that applies now. Absent: none has started, so nothing happens yet */
  stage?: LicenseStage
  /** The next step that lowers the tier, if one will */
  nextDrop?: {at: Date; tier: CappedTier}
}

export interface LicenseStatus {
  state: LicenseState
  /**
   * The highest tier an organization without a Stripe subscription may use. null means Starter. With no valid
   * license it's Enterprise for the grace period, so nothing is taken away yet.
   */
  maxTier: LicensedTier | null
  claims?: LicenseClaims
  /** Why the license is invalid */
  error?: string
  expiresAt?: Date
  /** When maxTier drops to Starter, for a missing or invalid license */
  graceEndsAt?: Date
  /** Whether any organization here has a paid tier without a Stripe subscription, so needs the license */
  needsLicense: boolean
  activeSeats?: number
  overSeats: boolean
  /** The license's onExpiry timeline, when it expires */
  expiry?: LicenseTimeline
  /** The license's onOverSeats timeline, while more users are active than it covers */
  overSeatsTimeline?: LicenseTimeline
}

interface Input {
  parsed: LicenseParseResult
  now: Date
  /** When this instance was first found to need a license it didn't have. null: not yet recorded */
  unlicensedSince: Date | null
  needsLicense: boolean
  activeSeats?: number
  /** When more users than the license covers first became active. null: not recorded, so now */
  overSeatsSince?: Date | null
}

const TIER_RANK = {starter: 0, team: 1, enterprise: 2} as const

/** Where `now` falls in a timeline that started at `start` */
export const getTimeline = (stages: LicenseStage[], start: Date, now: Date): LicenseTimeline => {
  const timeline: LicenseTimeline = {}
  for (const stage of stages) {
    const at = new Date(start.getTime() + stageOffsetMs(stage.from)!)
    if (at <= now) {
      timeline.stage = stage
    } else if (stage.tier && !timeline.nextDrop) {
      timeline.nextDrop = {at, tier: stage.tier}
    }
  }
  return timeline
}

const lowestTier = (tiers: (LicensedTier | CappedTier | undefined)[]) =>
  tiers.reduce<LicensedTier | CappedTier>(
    (lowest, tier) => (tier && TIER_RANK[tier] < TIER_RANK[lowest] ? tier : lowest),
    'enterprise'
  )

export const getLicenseStatus = ({
  parsed,
  now,
  unlicensedSince,
  needsLicense,
  activeSeats,
  overSeatsSince
}: Input): LicenseStatus => {
  if (parsed.ok) {
    const {claims} = parsed
    const overSeats =
      claims.seats !== undefined && activeSeats !== undefined && activeSeats > claims.seats
    const expiresAt = claims.expiresAt ? new Date(claims.expiresAt) : undefined
    const expiry = expiresAt ? getTimeline(claims.onExpiry, expiresAt, now) : undefined
    const overSeatsTimeline = overSeats
      ? getTimeline(claims.onOverSeats, overSeatsSince ?? now, now)
      : undefined
    const tier = lowestTier([claims.tier, expiry?.stage?.tier, overSeatsTimeline?.stage?.tier])
    return {
      state: expiresAt && now >= expiresAt ? 'expired' : 'valid',
      maxTier: tier === 'starter' ? null : tier,
      claims,
      expiresAt,
      needsLicense,
      activeSeats,
      overSeats,
      expiry,
      overSeatsTimeline
    }
  }
  const since = unlicensedSince ?? now
  const graceEndsAt = new Date(since.getTime() + LICENSE_GRACE_MS)
  return {
    state: parsed.reason,
    maxTier: now < graceEndsAt ? 'enterprise' : null,
    error: parsed.error,
    graceEndsAt,
    needsLicense,
    overSeats: false
  }
}
