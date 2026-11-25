import type {HttpResponse} from 'uWebSockets.js'
import appOrigin from '../appOrigin'
import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'
import writeJSON from './writeJSON'

const authorizationServerMetadataHandler = (res: HttpResponse) => {
  writeJSON(res, '200 OK', {
    issuer: appOrigin,
    authorization_endpoint: `${appOrigin}/oauth/authorize`,
    token_endpoint: `${appOrigin}/oauth/token`,
    registration_endpoint: `${appOrigin}/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: Object.values(OAuthScopeEnum)
  })
}

export default authorizationServerMetadataHandler
