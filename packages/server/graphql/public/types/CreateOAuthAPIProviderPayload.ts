import type {CreateOAuthApiProviderPayloadResolvers} from '../resolverTypes'

export type CreateOAuthApiProviderPayloadSource = {
  providerId: number
  clientId: string
  clientSecret: string | null
}

const CreateOAuthAPIProviderPayload: CreateOAuthApiProviderPayloadResolvers = {
  provider: (source, _args, {dataLoader}) => {
    return dataLoader.get('oAuthProviders').loadNonNull(source.providerId)
  }
}

export default CreateOAuthAPIProviderPayload
