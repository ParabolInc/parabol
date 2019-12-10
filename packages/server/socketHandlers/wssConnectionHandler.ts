import {TREBUCHET_WS} from '@mattkrick/trebuchet-client'
import express from 'express'
import {verify} from 'jsonwebtoken'
import url from 'url'
import ConnectionContext, {UserWebSocket} from '../socketHelpers/ConnectionContext'
import {clientSecret as auth0ClientSecret} from '../utils/auth0Helpers'
import handleConnect from './handleConnect'
import handleDisconnect from './handleDisconnect'
import handleMessage from './handleMessage'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'

const APP_VERSION = process.env.npm_package_version
const wssConnectionHandler = async (socket: UserWebSocket, req: express.Request) => {
  const {headers} = req
  const protocol = headers['sec-websocket-protocol']
  if (protocol !== TREBUCHET_WS) {
    // protocol error
    socket.close(1002)
    return
  }

  const {query} = url.parse(req.url, true)
  let authToken
  try {
    authToken = verify(query.token as string, Buffer.from(auth0ClientSecret, 'base64'))
  } catch (e) {
    // internal error (bad auth)
    socket.close(1011)
    return
  }
  const {sub: userId, iat} = authToken
  const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
  socket.close(1011, 'sessionInvalidated')
  const connectionContext = new ConnectionContext(socket, authToken, req.ip)
  socket.on('message', handleMessage(connectionContext))
  socket.on('close', handleDisconnect(connectionContext))
  const nextAuthToken = await handleConnect(connectionContext)
  socket.send(JSON.stringify({version: APP_VERSION, authToken: nextAuthToken}))
}

export default wssConnectionHandler
