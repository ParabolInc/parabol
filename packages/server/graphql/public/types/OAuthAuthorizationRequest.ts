import type {Oauthscopeenum} from '../../../postgres/types/pg'
import type {OAuthAuthorizationRequestResolvers} from '../resolverTypes'

export interface OAuthAuthorizationRequestSource {
  name: string
  orgId: string
  scopes: Oauthscopeenum[]
  redirectUri: string
}

const OAuthAuthorizationRequest: OAuthAuthorizationRequestResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default OAuthAuthorizationRequest
