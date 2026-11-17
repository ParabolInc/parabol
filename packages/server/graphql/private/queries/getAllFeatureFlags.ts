import {FEATURE_FLAGS} from '../../../utils/featureFlags'
import type {QueryResolvers} from '../resolverTypes'

const getAllFeatureFlags: QueryResolvers['getAllFeatureFlags'] = async () => {
  return Object.values(FEATURE_FLAGS).sort((a, b) => a.featureName.localeCompare(b.featureName))
}

export default getAllFeatureFlags
