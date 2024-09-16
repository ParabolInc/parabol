import {UpdateIntegrationProviderSuccessResolvers} from '../resolverTypes'

export type UpdateIntegrationProviderSuccessSource = {
  providerId: number
}

const UpdateIntegrationProviderSuccess: UpdateIntegrationProviderSuccessResolvers = {
  provider: async ({providerId}, _args, {dataLoader}) => {
    return dataLoader.get('integrationProviders').loadNonNull(providerId)
  }
}

export default UpdateIntegrationProviderSuccess
