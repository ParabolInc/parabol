import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {OrganizationUserResolvers} from '../resolverTypes'

const OrganizationUser: OrganizationUserResolvers = {
  featureTier: ({tier, trialStartDate}) => {
    return tier ? getFeatureTier({tier, trialStartDate}) : tier
  },
  billingTier: ({tier}) => tier
}

export default OrganizationUser
