import {type FeatureFlagName, getFeatureFlag} from '../../../utils/featureFlags'
import type {ToggleFeatureFlagPayloadResolvers} from '../resolverTypes'

export type ToggleFeatureFlagPayloadSource = {
  featureName: FeatureFlagName
  enabled: boolean
}

const ToggleFeatureFlagPayload: ToggleFeatureFlagPayloadResolvers = {
  featureFlag: ({featureName, enabled}) => {
    return {...getFeatureFlag(featureName), enabled}
  }
}

export default ToggleFeatureFlagPayload
