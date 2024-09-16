import {DeleteFeatureFlagSuccessResolvers} from '../resolverTypes'

export type DeleteFeatureFlagSuccessSource = {
  featureFlagId: string
}

const DeleteFeatureFlagSuccess: DeleteFeatureFlagSuccessResolvers = {
  featureFlag: async ({featureFlagId}, _args, {dataLoader}) => {
    return dataLoader.get('featureFlags').loadNonNull(featureFlagId)
  }
}

export default DeleteFeatureFlagSuccess
