import type {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'

export type PlanAction = 'current' | 'contact' | 'downgrade' | 'upgrade'

const getPlanAction = (billingTier: TierEnum, planTier: TierEnum): PlanAction => {
  if (billingTier === planTier) return 'current'
  if (billingTier === 'enterprise' || planTier === 'enterprise') return 'contact'
  return planTier === 'starter' ? 'downgrade' : 'upgrade'
}

export default getPlanAction
