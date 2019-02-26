import shortid from 'shortid'
import {IAuthToken} from '../../universal/types/graphql'
import RateLimiter from '../graphql/RateLimiter'

class ConnectionContext {
  authToken: IAuthToken
  availableResubs: Array<any> = []
  cancelKeepAlive: NodeJS.Timeout | null = null
  id = shortid.generate()
  isAlive = true
  rateLimiter: RateLimiter
  socket: WebSocket
  sharedDataLoader: any
  subs: any = {}
  constructor (socket, authToken, sharedDataLoader, rateLimiter) {
    this.authToken = authToken
    this.rateLimiter = rateLimiter
    this.socket = socket
    this.sharedDataLoader = sharedDataLoader
  }
}

export default ConnectionContext
