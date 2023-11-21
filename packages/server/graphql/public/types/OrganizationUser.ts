import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {OrganizationUserResolvers} from '../resolverTypes'

const OrganizationUser: OrganizationUserResolvers = {
  tier: ({tier, trialStartDate}) => {
    return tier ? getFeatureTier({tier, trialStartDate}) : tier
  },
  billingTier: ({tier}) => tier
}

export default OrganizationUser
