import {OrganizationUserResolvers} from '../resolverTypes'

const OrganizationUser: OrganizationUserResolvers = {
  tier: ({tier, trialStartDate}) => {
    if (tier === 'starter' && trialStartDate) {
      return 'team'
    }
    return tier
  },
  isTrial: ({tier, trialStartDate}) => {
    return !!trialStartDate && tier === 'starter'
  }
}

export default OrganizationUser
