import {UpdateIntegrationProviderSuccessResolvers} from '../resolverTypes'

export type UpdateIntegrationProviderSuccessSource = {
  providerId: number
  userId: string
}

const UpdateIntegrationProviderSuccess: UpdateIntegrationProviderSuccessResolvers = {
  provider: async ({providerId}, _args, {dataLoader}) => {
    return dataLoader.get('integrationProviders').loadNonNull(providerId)
  },
  user: async ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default UpdateIntegrationProviderSuccess
