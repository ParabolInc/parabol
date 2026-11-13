import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import type {OrganizationUserResolvers} from '../resolverTypes'

const OrganizationUser: OrganizationUserResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  },
  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  },
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
