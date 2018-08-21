const SSEPingHandler = (sharedDataLoader, rateLimiter, sseClients) => (req, res) => {
  const connectionId = req.headers['x-correlation-id']
  const connectionContext = sseClients[connectionId]
  if (connectionContext) {
    const authToken = req.headers['authorization'].split(' ')[1]
    if (authToken === connectionContext.authToken) {
      connectionContext.isAlive = true
    }
  }
  res.sendStatus(200)
}

export default SSEPingHandler
