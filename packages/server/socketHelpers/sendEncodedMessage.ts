import {HttpResponse, WebSocket} from 'uWebSockets.js'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import sendSSEMessage from '../sse/sendSSEMessage'
import ConnectionContext from './ConnectionContext'
import isHttpResponse from './isHttpResponse'

const ESTIMATED_MTU = 1400
const TIMEOUT_COEFFICIENT = 2.0
const MAX_TIMEOUT = 10000 // 10 seconds
const TIMEOUT_JITTER = 20 // 20 ms
const MAX_MESSAGE_ID = 128

const sendAndPushToReliableQueue = (
  context: ConnectionContext,
  synId: number,
  message: string,
  timeout = 2000 + Math.random() * TIMEOUT_JITTER
) => {
  const {socket, reliableQueue} = context
  if (timeout > MAX_TIMEOUT) {
    handleDisconnect(context)
    return
  }
  sendEncodedMessageBasedOnSocket(socket, message)
  const timer = setTimeout(() => {
    const newTimeout = timeout * TIMEOUT_COEFFICIENT + Math.random() * TIMEOUT_JITTER
    sendAndPushToReliableQueue(context, synId, message, newTimeout)
  }, timeout)
  reliableQueue[synId % MAX_MESSAGE_ID] = timer
}

const sendEncodedMessageBasedOnSocket = (socket: WebSocket | HttpResponse, message: string) => {
  isHttpResponse(socket)
    ? sendSSEMessage(socket as HttpResponse, message)
    : socket.send(message, false, message.length > ESTIMATED_MTU)
}

const sendEncodedMessage = (context: ConnectionContext, object: any, syn = false) => {
  const {socket} = context
  if (socket.done) return

  if (syn) {
    const synMessage = {
      synId: context.synId % MAX_MESSAGE_ID,
      object
    }
    const message = JSON.stringify(synMessage)
    sendAndPushToReliableQueue(context, context.synId, message)
    context.synId++
  } else {
    const message = JSON.stringify(object)
    sendEncodedMessageBasedOnSocket(socket, message)
  }
}

export default sendEncodedMessage
