import {ToggleAiFeaturesSuccessResolvers} from '../resolverTypes'

export type ToggleAIFeaturesSuccessSource = {
  orgId: string
}

const ToggleAIFeaturesSuccess: ToggleAiFeaturesSuccessResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return await dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default ToggleAIFeaturesSuccess
