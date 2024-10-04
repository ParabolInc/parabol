import isValid from '../../isValid'
import {ApplyFeatureFlagSuccessResolvers} from '../resolverTypes'

export type ApplyFeatureFlagSuccessSource = {
  featureFlagId: string
  userIds: string[] | null
  teamIds: string[] | null
  orgIds: string[] | null
}

const ApplyFeatureFlagSuccess: ApplyFeatureFlagSuccessResolvers = {
  featureFlag: async ({featureFlagId}, _args, {dataLoader}) => {
    return dataLoader.get('featureFlags').loadNonNull(featureFlagId)
  },
  users: async ({userIds}, _args, {dataLoader}) => {
    if (!userIds) return null
    return (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
  },
  teams: async ({teamIds}, _args, {dataLoader}) => {
    if (!teamIds) return null
    return (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
  },
  organizations: async ({orgIds}, _args, {dataLoader}) => {
    if (!orgIds) return null
    return (await dataLoader.get('organizations').loadMany(orgIds)).filter(isValid)
  }
}

export default ApplyFeatureFlagSuccess
