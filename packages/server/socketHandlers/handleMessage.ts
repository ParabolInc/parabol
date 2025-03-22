import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import {WebSocketBehavior} from 'uWebSockets.js'
import handleGraphQLTrebuchetRequest from '../graphql/handleGraphQLTrebuchetRequest'
import {wsErrors, wsMessages, wsMessageSize} from '../metrics/metricsHandler'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import handleReliableMessage from '../utils/handleReliableMessage'
import {Logger} from '../utils/Logger'
import sendToSentry from '../utils/sendToSentry'
import {SocketUserData} from './handleOpen'

const PONG = 0x9

// Get the port from environment variables
const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)

const handleParsedMessage = async (
  parsedMessage: OutgoingMessage,
  connectionContext: ConnectionContext
) => {
  const {type} = parsedMessage

  // Track message metrics if enabled
  if (process.env.ENABLE_METRICS === 'true') {
    wsMessages.inc({type: type as string, port: PORT.toString()})
    // Track message size
    const messageSize = JSON.stringify(parsedMessage).length
    wsMessageSize.observe({type: type as string, port: PORT.toString()}, messageSize)
  }

  try {
    switch (type) {
      case 'start':
        await handleGraphQLTrebuchetRequest(parsedMessage, connectionContext)
        break
      case 'stop':
        await handleGraphQLTrebuchetRequest(parsedMessage, connectionContext)
        break
      default:
        Logger.log(`Unknown message type: ${type}`)
    }
  } catch (error) {
    Logger.error('Error handling message:', error)
    if (process.env.ENABLE_METRICS === 'true') {
      wsErrors.inc({type: 'message_error', port: PORT.toString()})
    }
    if (error instanceof Error) {
      sendToSentry(error)
    }
  }
}

const handleMessage: WebSocketBehavior<SocketUserData>['message'] = (ws, message, isBinary) => {
  const userData = ws.getUserData()
  const {connectionContext} = userData
  if (!connectionContext) return

  try {
    if (isBinary) {
      const messageBuffer = Buffer.from(message)
      if (messageBuffer.length === 1 && messageBuffer[0] === PONG) {
        keepAlive(connectionContext)
        return
      }
      handleReliableMessage(messageBuffer, connectionContext)
      return
    }

    const parsedMessage = JSON.parse(message.toString())
    handleParsedMessage(parsedMessage, connectionContext)
  } catch (error) {
    Logger.error('Error in handleMessage:', error)
    if (process.env.ENABLE_METRICS === 'true') {
      wsErrors.inc({type: 'message_error', port: PORT.toString()})
    }
    if (error instanceof Error) {
      sendToSentry(error)
    }
  }
}

export default handleMessage
