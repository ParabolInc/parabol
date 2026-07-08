import {getFeatureFlagWithId} from '../../../utils/featureFlags'
import type {ToggleFeatureFlagSuccessResolvers} from '../resolverTypes'

export type ToggleFeatureFlagSuccessSource = {
  featureFlagId: string
  enabled: boolean
}

const ToggleFeatureFlagSuccess: ToggleFeatureFlagSuccessResolvers = {
  featureFlag: ({featureFlagId: featureName, enabled}) => {
    const flag = getFeatureFlagWithId(featureName)
    return {
      ...flag,
      enabled
    }
  }
}

export default ToggleFeatureFlagSuccess
