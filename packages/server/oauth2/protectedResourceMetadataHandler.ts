import type {HttpResponse} from 'uWebSockets.js'
import appOrigin from '../appOrigin'
import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'
import {MCP_RESOURCE} from './validateOAuthAuthorizationRequest'
import writeJSON from './writeJSON'

const protectedResourceMetadataHandler = (res: HttpResponse) => {
  writeJSON(res, '200 OK', {
    resource: MCP_RESOURCE,
    authorization_servers: [appOrigin],
    bearer_methods_supported: ['header'],
    resource_name: 'Parabol',
    scopes_supported: Object.values(OAuthScopeEnum)
  })
}

export default protectedResourceMetadataHandler
