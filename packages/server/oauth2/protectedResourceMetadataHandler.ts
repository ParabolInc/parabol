import type {HttpResponse} from 'uWebSockets.js'
import appOrigin from '../appOrigin'
import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'
import writeMetadata from './writeMetadata'

const protectedResourceMetadataHandler = (res: HttpResponse) => {
  writeMetadata(res, {
    resource: `${appOrigin}/mcp`,
    authorization_servers: [appOrigin],
    bearer_methods_supported: ['header'],
    resource_name: 'Parabol',
    scopes_supported: Object.values(OAuthScopeEnum)
  })
}

export default protectedResourceMetadataHandler
