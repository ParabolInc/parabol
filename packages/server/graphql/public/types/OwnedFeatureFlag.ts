import type {FeatureFlagRecord} from '../../../utils/featureFlags'
import type {OwnedFeatureFlagResolvers} from '../resolverTypes'

export type OwnedFeatureFlagSource = FeatureFlagRecord & {enabled: boolean}

const OwnedFeatureFlag: OwnedFeatureFlagResolvers = {
  id: ({featureName}) => featureName
}

export default OwnedFeatureFlag
