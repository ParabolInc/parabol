import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {OrganizationUserResolvers} from '../resolverTypes'

const OrganizationUser: OrganizationUserResolvers = {
  tier: async ({orgId}, _args, {dataLoader}) => {
    const org = await dataLoader.get('organizations').loadNonNull(orgId)
    const {tier, trialStartDate} = org
    return tier ? getFeatureTier({tier, trialStartDate}) : tier
  },
  billingTier: async ({orgId}, _args, {dataLoader}) => {
    const org = await dataLoader.get('organizations').loadNonNull(orgId)
    const {tier} = org
    return tier
  }
}

export default OrganizationUser
