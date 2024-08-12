import {TierEnum} from '../../public/resolverTypes'

export const getFeatureTier = ({
  tier,
  trialStartDate
}: {
  tier: TierEnum
  trialStartDate?: Date | null
}) => {
  if (tier === 'starter' && !!trialStartDate) {
    return 'team'
  }
  return tier
}
