import {AddFeatureFlagSuccessResolvers} from '../resolverTypes'

export type AddFeatureFlagSuccessSource = {
  featureFlagId: string
}

const AddFeatureFlagSuccess: AddFeatureFlagSuccessResolvers = {
  featureFlag: async ({featureFlagId}, _, {dataLoader}) => {
    return dataLoader.get('featureFlags').loadNonNull(featureFlagId)
  }
}

export default AddFeatureFlagSuccess
