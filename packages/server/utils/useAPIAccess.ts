import type {Plugin} from 'graphql-yoga'
import type {DataLoaderWorker} from '../graphql/graphql'
import type {ServerContext} from '../yoga'
import getAPIAuthToken from './getAPIAuthToken'
import getAPIGrant from './getAPIGrant'

export const useAPIAccess = (): Plugin<ServerContext & {dataLoader: DataLoaderWorker}> => {
  return {
    async onContextBuilding({context, extendContext}) {
      if (context.authToken) return
      const authHeader: string | null | undefined = context.request?.headers?.get('authorization')
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
      if (!bearerToken) return
      const grant = await getAPIGrant(bearerToken, context.dataLoader)
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
