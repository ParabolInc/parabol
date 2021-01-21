import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import {WebSocket} from 'uWebSockets.js'
import handleGraphQLTrebuchetRequest from '../graphql/handleGraphQLTrebuchetRequest'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import sendGQLMessage from '../socketHelpers/sendGQLMessage'
import sendToSentry from '../utils/sendToSentry'
import handleSignal from '../wrtc/signalServer/handleSignal'
import validateInit from '../wrtc/signalServer/validateInit'

interface WRTCMessage {
  type: 'WRTC_SIGNAL'
  signal: any
}

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
      sendGQLMessage(connectionContext, type, false, payload, opId)
    }
  })
}

const PONG = 65
const ACK_PREFIX = 6
const isPong = (message) => message.byteLength === 1 && Buffer.from(message)[0] === PONG
const isAck = (message) => message.byteLength === 2 && Buffer.from(message)[0] === ACK_PREFIX

const handleMessage = (websocket: WebSocket, message: ArrayBuffer) => {
  const {connectionContext} = websocket
  if (isPong(message)) {
    keepAlive(connectionContext)
    return
  }
  if (isAck(message)) {
    const ackId = Buffer.from(message)[1]
    const timeout: NodeJS.Timeout = connectionContext.reliableQueue[ackId]
    clearTimeout(timeout)
    delete connectionContext.reliableQueue[ackId]
    return
  }
  let parsedMessage
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

const safeHandleMessage = (websocket: WebSocket, message: ArrayBuffer) => {
  try {
    handleMessage(websocket, message)
  } catch (e) {
    sendToSentry(e)
  }
}
export default safeHandleMessage
