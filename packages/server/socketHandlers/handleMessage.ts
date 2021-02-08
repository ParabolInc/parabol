import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import {WebSocket} from 'uWebSockets.js'
import handleGraphQLTrebuchetRequest from '../graphql/handleGraphQLTrebuchetRequest'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import keepAlive from '../socketHelpers/keepAlive'
import {sendAndPushToReliableQueue} from '../socketHelpers/sendEncodedMessage'
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
const ACK = 0
const REQ = 1
const MASK = 1
const isPong = (message) => message.byteLength === 1 && Buffer.from(message)[0] === PONG
const isAck = (message) =>
  message.byteLength === 4 && (Buffer.from(message).readUInt32LE() & MASK) === ACK
const isReq = (message) =>
  message.byteLength === 4 && (Buffer.from(message).readUInt32LE() & MASK) === REQ

const handleMessage = (
  websocket: WebSocket | {connectionContext: ConnectionContext},
  message: ArrayBuffer
) => {
  const {connectionContext} = websocket
  if (isPong(message)) {
    keepAlive(connectionContext)
    return
  }
  if (isAck(message)) {
    const mid = Buffer.from(message).readUInt32LE() >> 1
    const timer = connectionContext.reliableQueue[mid].timer
    clearTimeout(timer)
    delete connectionContext.reliableQueue[mid]
    return
  }
  if (isReq(message)) {
    const mid = Buffer.from(message).readUInt32LE() >> 1
    const timer = connectionContext.reliableQueue[mid].timer
    const object = connectionContext.reliableQueue[mid].object
    clearTimeout(timer)
    sendAndPushToReliableQueue(connectionContext, mid, object)
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
