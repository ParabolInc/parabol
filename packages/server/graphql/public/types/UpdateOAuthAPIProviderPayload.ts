import type {UpdateOAuthApiProviderPayloadResolvers} from '../resolverTypes'

export type UpdateOAuthAPIProviderPayloadSource = {
  providerId: number
  organizationId: string
}

const UpdateOAuthAPIProviderPayload: UpdateOAuthApiProviderPayloadResolvers = {
  provider: ({providerId}, _args, {dataLoader}) => {
    return dataLoader.get('oAuthProviders').loadNonNull(providerId)
  },
  organization: ({organizationId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(organizationId)
  }
}

export default UpdateOAuthAPIProviderPayload
