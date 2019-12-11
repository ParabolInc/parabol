import {verify} from 'jsonwebtoken'
import express from 'express'
import sseClients from '../sseClients'

const SERVER_SECRET = process.env.AUTH0_CLIENT_SECRET!

const SSEPingHandler = (req: express.Request, res: express.Response) => {
  const connectionId = req.headers['x-correlation-id']
  const connectionContext = sseClients.get(connectionId)
  if (connectionContext) {
    const token = req.headers['authorization']!.split(' ')[1]
    let authToken
    try {
      authToken = verify(token, Buffer.from(SERVER_SECRET, 'base64'))
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
