import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import {decode} from '@msgpack/msgpack'
import {WebSocket} from 'uWebSockets.js'
import handleGraphQLTrebuchetRequest from '../graphql/handleGraphQLTrebuchetRequest'
import PROD from '../PROD'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import sendGQLMessage from '../socketHelpers/sendGQLMessage'
import handleSignal from '../wrtc/signalServer/handleSignal'
import validateInit from '../wrtc/signalServer/validateInit'

interface WRTCMessage {
  type: 'WRTC_SIGNAL'
  signal: any
}

const decoder = PROD ? decode : JSON.parse

const handleParsedMessage = async (
  parsedMessage: OutgoingMessage | WRTCMessage,
  connectionContext: ConnectionContext
) => {
  const {socket, authToken} = connectionContext
  const parsedMessages = Array.isArray(parsedMessage) ? parsedMessage : [parsedMessage]
  parsedMessages.forEach(async (msg) => {
    if (msg.type === 'WRTC_SIGNAL') {
      if (validateInit(socket as any, msg.signal, authToken)) {
        handleSignal(socket as any, msg.signal)
      }
      return
    }
    const response = await handleGraphQLTrebuchetRequest(msg, connectionContext)
    if (response) {
      const {type, id: opId, payload} = response
      sendGQLMessage(socket, type, payload, opId)
    }
  })
}

const PONG = 65
const handleMessage = (websocket: WebSocket, message: ArrayBuffer, isBinary: boolean) => {
  const {connectionContext} = websocket
  if (isBinary && message.byteLength === 1 && Buffer.from(message)[0] === PONG) {
    keepAlive(connectionContext)
    return
  }
  let parsedMessage
  try {
    parsedMessage = isBinary ? decoder(message as any) : JSON.parse(Buffer.from(message).toString())
  } catch (e) {
    /*
     * Invalid frame payload data
     * The endpoint is terminating the connection because a message was received that contained inconsistent data
     * (e.g., non-UTF-8 data within a text message).
     */
    // handleDisconnect(connectionContext, {exitCode: 1007})()
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

export default handleMessage
