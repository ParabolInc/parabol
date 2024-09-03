import {ApplyFeatureFlagSuccessResolvers} from '../resolverTypes'

export type ApplyFeatureFlagSuccessSource = {
  featureFlagId: string
  userIds: string[] | null
  teamIds: string[] | null
  orgIds: string[] | null
}

const ApplyFeatureFlagSuccess: ApplyFeatureFlagSuccessResolvers = {
  featureFlag: async ({featureFlagId}, _args, {dataLoader}) => {
    return null
  },
  users: async ({userIds}, _args, {dataLoader}) => {
    if (!userIds) return null
    return dataLoader.get('users').loadMany(userIds)
  },
  teams: async ({teamIds}, _args, {dataLoader}) => {
    if (!teamIds) return null
    return dataLoader.get('teams').loadMany(teamIds)
  },
  organizations: async ({orgIds}, _args, {dataLoader}) => {
    if (!orgIds) return null
    return dataLoader.get('organizations').loadMany(orgIds)
  }
}

export default ApplyFeatureFlagSuccess
