import type {GQLContext} from '../../graphql'
import type {
  UpdateOAuthApiProviderPayloadResolvers,
  UpdateOAuthApiProviderSuccessResolvers
} from '../resolverTypes'

export type UpdateOAuthAPIProviderPayloadSource = {
  providerId: number
  organizationId: string
}

const UpdateOAuthAPIProviderPayload: UpdateOAuthApiProviderPayloadResolvers &
  UpdateOAuthApiProviderSuccessResolvers = {
  provider: (
    source: UpdateOAuthAPIProviderPayloadSource,
    _args: unknown,
    {dataLoader}: GQLContext
  ) => {
    return dataLoader.get('oAuthProviders').loadNonNull(source.providerId)
  },
  organization: (
    source: UpdateOAuthAPIProviderPayloadSource,
    _args: unknown,
    {dataLoader}: GQLContext
  ) => {
    return dataLoader.get('organizations').loadNonNull(source.organizationId)
  }
}

export default UpdateOAuthAPIProviderPayload
