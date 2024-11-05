import {ToggleFeatureFlagSuccessResolvers} from '../resolverTypes'

export type ToggleFeatureFlagSuccessSource = {
  featureFlagId: string
  enabled: boolean
}

const ToggleFeatureFlagSuccess: ToggleFeatureFlagSuccessResolvers = {
  featureFlag: async ({featureFlagId, enabled}, _, {dataLoader}) => {
    const flag = await dataLoader.get('featureFlags').loadNonNull(featureFlagId)
    return {
      ...flag,
      enabled
    }
  }
}

export default ToggleFeatureFlagSuccess
