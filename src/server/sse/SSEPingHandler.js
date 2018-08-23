import {verify} from 'jsonwebtoken'
import {clientSecret as auth0ClientSecret} from 'server/utils/auth0Helpers'

const SSEPingHandler = (sseClients) => (req, res) => {
  const connectionId = req.headers['x-correlation-id']
  const connectionContext = sseClients[connectionId]
  if (connectionContext) {
    const token = req.headers['authorization'].split(' ')[1]
    let authToken
    try {
      authToken = verify(token, Buffer.from(auth0ClientSecret, 'base64'))
    } catch (e) {
      return
    }
    if (authToken.sub === connectionContext.authToken.sub) {
      connectionContext.isAlive = true
    }
  }
  res.sendStatus(200)
}

export default SSEPingHandler
