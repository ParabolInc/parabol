import {HttpResponse, WebSocket} from 'uWebSockets.js'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import sendSSEMessage from '../sse/sendSSEMessage'
import ConnectionContext from './ConnectionContext'
import isHttpResponse from './isHttpResponse'

const ESTIMATED_MTU = 1400
const TIMEOUT_COEFFICIENT = 2.0
const INITIAL_TIMEOUT = 2000 // 2 seconds
const MAX_TIMEOUT = 10000 // 10 seconds
const TIMEOUT_JITTER = 20 // 20 ms

const sendAndPushToReliableQueue = (
  context: ConnectionContext,
  mid: number,
  message: string,
  timeout = INITIAL_TIMEOUT + Math.random() * TIMEOUT_JITTER
) => {
  const {socket, reliableQueue} = context
  if (timeout > MAX_TIMEOUT) {
    handleDisconnect(context)
    return
  }
  sendEncodedMessageBasedOnSocket(socket, message)
  const timer = setTimeout(() => {
    const newTimeout = timeout * TIMEOUT_COEFFICIENT + Math.random() * TIMEOUT_JITTER
    sendAndPushToReliableQueue(context, mid, message, newTimeout)
  }, timeout)

  context.clearEntryForReliableQueue(mid)
  reliableQueue[mid] = {timer, message}
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
    const mid = context.getMid()
    const message = JSON.stringify([object, mid])
    sendAndPushToReliableQueue(context, mid, message)
  } else {
    const message = JSON.stringify(object)
    sendEncodedMessageBasedOnSocket(socket, message)
  }
}

export {sendEncodedMessage, sendAndPushToReliableQueue}
