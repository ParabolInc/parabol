import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import {Data} from '@mattkrick/trebuchet-client'
import {decode} from '@msgpack/msgpack'
import handleGraphQLTrebuchetRequest from '../graphql/handleGraphQLTrebuchetRequest'
import PROD from '../PROD'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import sendGQLMessage from '../socketHelpers/sendGQLMessage'
import handleSignal, {UWebSocket} from '../wrtc/signalServer/handleSignal'
import validateInit from '../wrtc/signalServer/validateInit'
import handleDisconnect from './handleDisconnect'

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
      if (validateInit(socket as UWebSocket, msg.signal, authToken)) {
        handleSignal(socket as UWebSocket, msg.signal)
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

const handleMessage = (connectionContext: ConnectionContext) => async (message: Data) => {
  let parsedMessage
  try {
    parsedMessage = decoder(message as any)
  } catch (e) {
    /*
     * Invalid frame payload data
     * The endpoint is terminating the connection because a message was received that contained inconsistent data
     * (e.g., non-UTF-8 data within a text message).
     */
    handleDisconnect(connectionContext, {exitCode: 1007})()
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
