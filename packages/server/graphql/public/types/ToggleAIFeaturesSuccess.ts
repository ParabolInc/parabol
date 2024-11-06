// import {ToggleAIFeaturesSuccessResolvers} from '../resolverTypes'

export type ToggleAIFeaturesSuccessSource = {
  orgId: string
}

const ToggleAIFeaturesSuccess: any = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return await dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default ToggleAIFeaturesSuccess
