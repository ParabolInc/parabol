import ms from 'ms'
import type {LicenseClaims, LicensedTier, LicenseParseResult} from './licenseToken'

/** How long an instance keeps its paid features after its license expires, or after it's found without one */
export const LICENSE_GRACE_MS = ms('30d')
/** How long before expiry admins are warned */
export const LICENSE_EXPIRY_WARNING_MS = ms('30d')

export type LicenseState = 'valid' | 'expiring' | 'expired' | 'missing' | 'invalid'

export interface LicenseStatus {
  state: LicenseState
  /**
   * The highest tier an organization without a Stripe subscription may use. null means Starter. During a grace
   * period it's the license's tier, or, with no valid license, Enterprise: nothing is taken away yet.
   */
  maxTier: LicensedTier | null
  claims?: LicenseClaims
  /** Why the license is invalid */
  error?: string
  expiresAt?: Date
  /** When maxTier drops to Starter, for an expired, missing or invalid license */
  graceEndsAt?: Date
  /** Whether any organization here has a paid tier without a Stripe subscription, so needs the license */
  needsLicense: boolean
  activeSeats?: number
  overSeats: boolean
}

interface Input {
  parsed: LicenseParseResult
  now: Date
  /** When this instance was first found to need a license it didn't have. null: not yet recorded */
  unlicensedSince: Date | null
  needsLicense: boolean
  activeSeats?: number
}

export const getLicenseStatus = ({
  parsed,
  now,
  unlicensedSince,
  needsLicense,
  activeSeats
}: Input): LicenseStatus => {
  if (parsed.ok) {
    const {claims} = parsed
    const overSeats =
      claims.seats !== undefined && activeSeats !== undefined && activeSeats > claims.seats
    const expiresAt = claims.expiresAt ? new Date(claims.expiresAt) : undefined
    if (!expiresAt || now < expiresAt) {
      const expiring =
        !!expiresAt && expiresAt.getTime() - now.getTime() <= LICENSE_EXPIRY_WARNING_MS
      return {
        state: expiring ? 'expiring' : 'valid',
        maxTier: claims.tier,
        claims,
        expiresAt,
        needsLicense,
        activeSeats,
        overSeats
      }
    }
    const graceEndsAt = new Date(expiresAt.getTime() + LICENSE_GRACE_MS)
    return {
      state: 'expired',
      maxTier: now < graceEndsAt ? claims.tier : null,
      claims,
      expiresAt,
      graceEndsAt,
      needsLicense,
      activeSeats,
      overSeats
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
