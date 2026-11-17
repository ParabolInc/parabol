import type {Plugin} from 'graphql-yoga'
import {getFreshTokenIfNeeded} from '../getFreshTokenIfNeeded'
import type {DataLoaderWorker} from '../graphql/graphql'
import type {ServerContext} from '../yoga'
import {setAuthCookie} from './authCookie'

export const useFreshAuthToken = (): Plugin<ServerContext & {dataLoader: DataLoaderWorker}> => {
  return {
    async onExecute({args}) {
      const context = args.contextValue
      const {authToken, dataLoader, request} = context
      if (!request || !authToken?.sub || authToken.aud !== 'action') return
      const teamIds = await dataLoader.get('teamIdsByUserId').load(authToken.sub)
      const freshToken = getFreshTokenIfNeeded(authToken, teamIds)
      if (!freshToken) return
      context.authToken = freshToken
      setAuthCookie(context, freshToken)
    }
  }
}
