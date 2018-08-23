import shortid from 'shortid'

class ConnectionContext {
  constructor (socket, authToken, sharedDataLoader, rateLimiter) {
    this.authToken = authToken
    this.availableResubs = []
    this.cancelKeepAlive = null
    this.id = shortid.generate()
    this.isAlive = true
    this.rateLimiter = rateLimiter
    this.socket = socket
    this.sharedDataLoader = sharedDataLoader
    this.subs = {}
  }
}

export default ConnectionContext
