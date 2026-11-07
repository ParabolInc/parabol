import {capTierByLicense} from '../../../license/capTierByLicense'
import type {TierEnum} from '../../public/resolverTypes'

/**
 * The tier whose features an organization gets: a Starter organization in a trial gets Team's, and a paid tier
 * without a Stripe subscription needs the instance's license (capTierByLicense).
 */
export const getFeatureTier = ({
  tier,
  trialStartDate,
  stripeSubscriptionId
}: {
  tier: TierEnum
  trialStartDate?: Date | null
  stripeSubscriptionId: string | null
}) => {
  if (tier === 'starter') {
    return trialStartDate ? 'team' : 'starter'
  }
  return capTierByLicense({tier, stripeSubscriptionId})
}
