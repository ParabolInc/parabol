import type {TierEnum} from '../graphql/public/resolverTypes'
import {getCurrentLicenseStatus} from './licenseState'

/**
 * The tier an organization may use. A paid tier is Parabol's to grant: on SaaS through a Stripe subscription, and
 * everywhere else through the instance's license, without which an organization without a subscription gets Starter.
 */
export const capTier = (
  tier: TierEnum,
  hasStripeSubscription: boolean,
  paidTiersAllowed: boolean
): TierEnum => {
  if (tier === 'starter' || hasStripeSubscription || paidTiersAllowed) return tier
  return 'starter'
}

export const capTierByLicense = ({
  tier,
  stripeSubscriptionId
}: {
  tier: TierEnum
  stripeSubscriptionId: string | null
}) => capTier(tier, !!stripeSubscriptionId, getCurrentLicenseStatus().paidTiersAllowed)

/** Whether an organization's paid tier rests on the license: it has one, without a Stripe subscription */
export const dependsOnLicense = ({
  tier,
  stripeSubscriptionId
}: {
  tier: TierEnum
  stripeSubscriptionId: string | null
}) => tier !== 'starter' && !stripeSubscriptionId
