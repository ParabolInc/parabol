import isValid from '../../isValid'
import {GetFeatureFlagSuccessResolvers} from '../resolverTypes'

export type GetFeatureFlagSuccessSource = {
  featureFlagIds: string[]
}

const GetFeatureFlagSuccess: GetFeatureFlagSuccessResolvers = {
  featureFlags: async ({featureFlagIds}, _, {dataLoader}) => {
    const flags = await dataLoader.get('featureFlags').loadMany(featureFlagIds)
    return flags.filter(isValid)
  }
}

export default GetFeatureFlagSuccess
