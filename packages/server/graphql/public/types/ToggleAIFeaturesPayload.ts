import type {ToggleAiFeaturesPayloadResolvers} from '../resolverTypes'

export type ToggleAIFeaturesPayloadSource = {
  orgId: string
}

const ToggleAIFeaturesPayload: ToggleAiFeaturesPayloadResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return await dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default ToggleAIFeaturesPayload
