import ms from 'ms'
import {
  type LicenseAction,
  type LicenseClaims,
  type LicenseParseResult,
  type LicenseStage,
  stageOffsetMs
} from './licenseToken'

/** How long an instance keeps its paid features after it's found without a valid license */
export const LICENSE_GRACE_MS = ms('30d')

export type LicenseState = 'valid' | 'expired' | 'missing' | 'invalid'

/** Where the instance is in one of its license's timelines */
export interface LicenseTimeline {
  /** The step that applies now. Absent: none has started, so nothing happens yet */
  stage?: LicenseStage
  /** The next step with an action, if one is still to come */
  nextAction?: {at: Date; action: LicenseAction}
}

export interface LicenseStatus {
  state: LicenseState
  /**
   * Whether organizations without a Stripe subscription keep their paid tier. A license grants it, whatever its
   * steps; with no valid license it lasts for the grace period, so nothing is taken away at once.
   */
  paidTiersAllowed: boolean
  /** Whether a step with the read-only action applies, while organizations depend on the license */
  readOnly: boolean
  claims?: LicenseClaims
  /** Why the license is invalid */
  error?: string
  expiresAt?: Date
  /** When paid tiers end, for a missing or invalid license */
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

/** Where `now` falls in a timeline that started at `start` */
export const getTimeline = (stages: LicenseStage[], start: Date, now: Date): LicenseTimeline => {
  const timeline: LicenseTimeline = {}
  for (const stage of stages) {
    const at = new Date(start.getTime() + stageOffsetMs(stage.from)!)
    if (at <= now) {
      timeline.stage = stage
    } else if (stage.action && !timeline.nextAction) {
      timeline.nextAction = {at, action: stage.action}
    }
  }
  return timeline
}

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
    const readOnly =
      needsLicense &&
      (expiry?.stage?.action === 'read-only' || overSeatsTimeline?.stage?.action === 'read-only')
    return {
      state: expiresAt && now >= expiresAt ? 'expired' : 'valid',
      paidTiersAllowed: true,
      readOnly,
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
    paidTiersAllowed: now < graceEndsAt,
    readOnly: false,
    error: parsed.error,
    graceEndsAt,
    needsLicense,
    overSeats: false
  }
}
