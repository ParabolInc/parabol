import {type FeatureFlagName, getFeatureFlag} from '../../../utils/featureFlags'
import isValid from '../../isValid'
import type {RemoveFeatureFlagOwnerSuccessResolvers} from '../resolverTypes'

export type RemoveFeatureFlagOwnerSuccessSource = {
  featureName: FeatureFlagName
  userIds: string[] | null
  teamIds: string[] | null
  orgIds: string[] | null
  removedCount: number
}

const RemoveFeatureFlagOwnerSuccess: RemoveFeatureFlagOwnerSuccessResolvers = {
  featureFlag: ({featureName}) => {
    return getFeatureFlag(featureName)
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
  },
  removedCount: ({removedCount}) => removedCount
}

export default RemoveFeatureFlagOwnerSuccess
