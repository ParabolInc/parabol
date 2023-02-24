import {WebSocketBehavior} from 'uWebSockets.js'
import AuthToken from '../database/types/AuthToken'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import {sendEncodedMessage} from '../socketHelpers/sendEncodedMessage'
import handleConnect from './handleConnect'

const APP_VERSION = process.env.npm_package_version
export type SocketUserData = {
  connectionContext: ConnectionContext
  authToken: AuthToken
  ip: string
  done?: true
}

const handleOpen: WebSocketBehavior<SocketUserData>['open'] = async (socket) => {
  const {authToken, ip} = socket.getUserData()
  const connectionContext = (socket.getUserData().connectionContext = new ConnectionContext(
    socket,
    authToken,
    ip
  ))
  // messages will start coming in before handleConnect completes & sit in the readyQueue
  const nextAuthToken = await handleConnect(connectionContext)
  sendEncodedMessage(connectionContext, {version: APP_VERSION, authToken: nextAuthToken})
  keepAlive(connectionContext)
}

export default handleOpen
