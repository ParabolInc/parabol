import type {UpdateIntegrationProviderPayloadResolvers} from '../resolverTypes'

export type UpdateIntegrationProviderPayloadSource = {
  providerId: number
}

const UpdateIntegrationProviderPayload: UpdateIntegrationProviderPayloadResolvers = {
  provider: async ({providerId}, _args, {dataLoader}) => {
    return dataLoader.get('integrationProviders').loadNonNull(providerId)
  }
}

export default UpdateIntegrationProviderPayload
