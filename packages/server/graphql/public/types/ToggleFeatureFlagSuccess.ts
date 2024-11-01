// import {ToggleFeatureFlagSuccessResolvers} from '../resolverTypes'

export type ToggleFeatureFlagSuccessSource = {
  ownerId: string
  featureName: boolean
}

const ToggleFeatureFlagSuccess: any = {
  featureFlag: async ({ownerId, featureName}, _, {dataloader}) => {
    return dataloader.get('featureFlagByOwnerId').load({ownerId, featureName})
  }
}

export default ToggleFeatureFlagSuccess
