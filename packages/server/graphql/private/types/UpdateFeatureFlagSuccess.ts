import {UpdateFeatureFlagSuccessResolvers} from '../resolverTypes'

export type UpdateFeatureFlagSuccessSource = {
  featureFlagId: string
}

const UpdateFeatureFlagSuccess: UpdateFeatureFlagSuccessResolvers = {
  featureFlag: async ({featureFlagId}, _args, {dataLoader}) => {
    return dataLoader.get('featureFlags').loadNonNull(featureFlagId)
  }
}

export default UpdateFeatureFlagSuccess
