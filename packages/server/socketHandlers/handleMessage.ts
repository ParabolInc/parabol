import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import {WebSocketBehavior} from 'uWebSockets.js'
import handleGraphQLTrebuchetRequest from '../graphql/handleGraphQLTrebuchetRequest'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import sendGQLMessage from '../socketHelpers/sendGQLMessage'
import handleReliableMessage from '../utils/handleReliableMessage'
import sendToSentry from '../utils/sendToSentry'
import {SocketUserData} from './handleOpen'

const handleParsedMessage = async (
  parsedMessage: OutgoingMessage,
  connectionContext: ConnectionContext
) => {
  const parsedMessages = Array.isArray(parsedMessage) ? parsedMessage : [parsedMessage]
  parsedMessages.forEach(async (msg) => {
    const response = await handleGraphQLTrebuchetRequest(msg, connectionContext)
    // only reply if an opId was included. no opId = no sink on client = ignored
    if (response?.id) {
      const {type, id: opId, payload} = response
      sendGQLMessage(connectionContext, opId, type, false, payload)
    }
  })
}

const PONG = 65
const isPong = (messageBuffer: Buffer) => messageBuffer.length === 1 && messageBuffer[0] === PONG

const handleMessage: WebSocketBehavior<SocketUserData>['message'] = (websocket, message) => {
  const {connectionContext} = websocket.getUserData()
  const messageBuffer = Buffer.from(message)
  if (isPong(messageBuffer)) {
    keepAlive(connectionContext)
    return
  }
  if (messageBuffer.length === 4) {
    handleReliableMessage(messageBuffer, connectionContext)
    return
  }
  let parsedMessage: OutgoingMessage
  try {
    parsedMessage = JSON.parse(Buffer.from(message).toString())
  } catch (e) {
    // ignore the message
    return
  }

  if (connectionContext.isReady) {
    handleParsedMessage(parsedMessage, connectionContext)
  } else {
    connectionContext.readyQueue.push(() => {
      handleParsedMessage(parsedMessage, connectionContext)
    })
  }
}

const safeHandleMessage: WebSocketBehavior<SocketUserData>['message'] = (
  websocket,
  message,
  isBinary
) => {
  try {
    handleMessage(websocket, message, isBinary)
  } catch (e) {
    const error = e instanceof Error ? e : new Error('handleMessage failed')
    sendToSentry(error)
  }
}
export default safeHandleMessage
