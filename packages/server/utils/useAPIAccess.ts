import type {Plugin} from 'graphql-yoga'
import type {DataLoaderWorker} from '../graphql/graphql'
import type {ServerContext} from '../yoga'
import getAPIAuthToken from './getAPIAuthToken'
import getAPIGrant from './getAPIGrant'
import getRequestCredential from './getRequestCredential'

export const useAPIAccess = (): Plugin<ServerContext & {dataLoader: DataLoaderWorker}> => {
  return {
    async onContextBuilding({context, extendContext}) {
      if (context.authToken) return
      const headers = context.request?.headers
      const credential = getRequestCredential({
        cookie: headers?.get('cookie'),
        authorization: headers?.get('authorization'),
        applicationAuthorization: headers?.get('x-application-authorization')
      })
      if (credential.kind !== 'pat' && credential.kind !== 'oauth') return
      const grant = await getAPIGrant(
        credential.token,
        context.dataLoader,
        context.expectedResource
      )
      if (!grant) return
      const authToken = await getAPIAuthToken(grant, context.dataLoader)
      extendContext({
        resourceGrants: grant.resourceGrants,
        authToken,
        personalAccessTokenId: grant.personalAccessTokenId
      })
    }
  }
}
