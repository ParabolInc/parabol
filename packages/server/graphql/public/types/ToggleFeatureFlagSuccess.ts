import {type FeatureFlagName, getFeatureFlag} from '../../../utils/featureFlags'
import type {ToggleFeatureFlagSuccessResolvers} from '../resolverTypes'

export type ToggleFeatureFlagSuccessSource = {
  featureName: FeatureFlagName
  enabled: boolean
}

const ToggleFeatureFlagSuccess: ToggleFeatureFlagSuccessResolvers = {
  featureFlag: ({featureName, enabled}) => {
    return {...getFeatureFlag(featureName), enabled}
  }
}

export default ToggleFeatureFlagSuccess
