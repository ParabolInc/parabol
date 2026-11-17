import type {FeatureFlagResolvers} from '../resolverTypes'

const FeatureFlag: FeatureFlagResolvers = {
  id: ({featureName}) => featureName
}

export default FeatureFlag
