import type {TierEnum} from '../graphql/public/resolverTypes'
import {getCurrentLicenseStatus} from './licenseState'
import type {LicensedTier} from './licenseToken'

const TIER_RANK: Record<TierEnum, number> = {starter: 0, team: 1, enterprise: 2}

/**
 * The tier an organization may use. A paid tier is Parabol's to grant: on SaaS through a Stripe subscription, and
 * everywhere else through the instance's license, which caps every organization without a subscription.
 */
export const capTier = (
  tier: TierEnum,
  hasStripeSubscription: boolean,
  maxTier: LicensedTier | null
): TierEnum => {
  if (tier === 'starter' || hasStripeSubscription) return tier
  if (!maxTier) return 'starter'
  return TIER_RANK[tier] <= TIER_RANK[maxTier] ? tier : maxTier
}

export const capTierByLicense = ({
  tier,
  stripeSubscriptionId
}: {
  tier: TierEnum
  stripeSubscriptionId: string | null
}) => capTier(tier, !!stripeSubscriptionId, getCurrentLicenseStatus().maxTier)

/** Whether an organization's paid tier rests on the license: it has one, without a Stripe subscription */
export const dependsOnLicense = ({
  tier,
  stripeSubscriptionId
}: {
  tier: TierEnum
  stripeSubscriptionId: string | null
}) => tier !== 'starter' && !stripeSubscriptionId
