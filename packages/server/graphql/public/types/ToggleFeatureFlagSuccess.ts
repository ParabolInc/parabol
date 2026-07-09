import {FEATURE_FLAGS, type FeatureFlagName} from '../../../utils/featureFlags'
import type {ToggleFeatureFlagSuccessResolvers} from '../resolverTypes'

export type ToggleFeatureFlagSuccessSource = {
  featureName: string
  enabled: boolean
}

const ToggleFeatureFlagSuccess: ToggleFeatureFlagSuccessResolvers = {
  featureFlag: ({featureName, enabled}) => {
    return {...FEATURE_FLAGS[featureName as FeatureFlagName], id: featureName, enabled}
  }
}

export default ToggleFeatureFlagSuccess
