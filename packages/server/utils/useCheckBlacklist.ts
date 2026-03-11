import type {Plugin} from 'graphql-yoga'
import type {ServerContext} from '../yoga'
import checkBlacklistJWT from './checkBlacklistJWT'

export const useCheckBlacklist = (): Plugin<ServerContext> => {
  return {
    async onExecute({args}) {
      const {contextValue} = args
      const {authToken} = contextValue
      if (!authToken?.sub || !authToken?.iat) return
      const isBlacklisted = await checkBlacklistJWT(authToken.sub, authToken.iat)
      if (isBlacklisted) {
        contextValue.authToken = null
      }
    }
  }
}
