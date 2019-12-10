import ConnectionContext from './socketHelpers/ConnectionContext'

class SSEClients {
  store = {}
  get(connectionId: unknown) {
    return this.store[String(connectionId)]
  }
  set(connectionContext: ConnectionContext) {
    this.store[connectionContext.id] = connectionContext
  }
  delete(connectionId: string) {
    delete this.store[connectionId]
  }
}

export default new SSEClients()
