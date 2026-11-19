import type {Oauthscopeenum} from '../../../postgres/types/pg'
import type {OAuthAuthorizationRequestResolvers} from '../resolverTypes'

export interface OAuthAuthorizationRequestSource {
  name: string
  orgId: string | null
  scopes: Oauthscopeenum[]
  redirectUri: string
}

const OAuthAuthorizationRequest: OAuthAuthorizationRequestResolvers = {
  organization: ({orgId}, _args, {dataLoader}) =>
    orgId ? dataLoader.get('organizations').loadNonNull(orgId) : null
}

export default OAuthAuthorizationRequest
