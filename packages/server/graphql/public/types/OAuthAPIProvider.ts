import {CipherId} from '../../../utils/CipherId'
import type {OAuthApiProviderResolvers} from '../resolverTypes'

const OAuthAPIProvider: OAuthApiProviderResolvers = {
  id: (oauthApiProvider) => CipherId.toClient(oauthApiProvider.id, 'OAuthAPIProvider')
}

export default OAuthAPIProvider
