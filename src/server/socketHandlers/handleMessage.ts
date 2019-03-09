import {ClientMessageTypes} from '@mattkrick/graphql-trebuchet-client'
import {Data, Events} from '@mattkrick/trebuchet-client'
import queryMap from 'server/graphql/queryMap.json'
import handleDisconnect from 'server/socketHandlers/handleDisconnect'
import sendMessage from 'server/socketHelpers/sendMessage'
import handleGraphQLTrebuchetRequest from '../graphql/handleGraphQLTrebuchetRequest'
import isQueryAllowed from '../graphql/isQueryAllowed'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import {getUserId} from '../utils/authorization'
import sendToSentry from '../utils/sendToSentry'
import handleSignal, {UWebSocket} from '../wrtc/signalServer/handleSignal'
import WebSocketContext from '../wrtc/signalServer/WebSocketContext'
const {GQL_ERROR} = ClientMessageTypes

const handleMessage = (connectionContext: ConnectionContext) => async (message: Data) => {
  const {socket} = connectionContext
  // catch raw, non-graphql protocol messages here
  if (message === Events.KEEP_ALIVE) {
    connectionContext.isAlive = true
    return
  }

  let parsedMessage
  try {
    parsedMessage = JSON.parse(message as string)
  } catch (e) {
    /*
     * Invalid frame payload data
     * The endpoint is terminating the connection because a message was received that contained inconsistent data
     * (e.g., non-UTF-8 data within a text message).
     */
    handleDisconnect(connectionContext, {exitCode: 1007})()
    return
  }

  if (parsedMessage.type === 'WRTC_SIGNAL') {
    const {socket} = connectionContext
    const {signal} = parsedMessage
    if (!socket.context) {
      if (signal.type !== 'init') return
      socket.context = new WebSocketContext(connectionContext.authToken.tms as string[])
    }
    handleSignal(connectionContext.socket as UWebSocket, signal)
    return
  }
  try {
    const response = await handleGraphQLTrebuchetRequest(parsedMessage, connectionContext, {
      persistedQueries: queryMap,
      isQueryAllowed
    })
    if (response) {
      const {type, id: opId, payload} = response
      sendMessage(socket, type, payload, opId)
    }
  } catch (e) {
    const userId = getUserId(connectionContext.authToken)
    sendToSentry(e, {userId})
    sendMessage(socket, GQL_ERROR, {errors: [e.message]})
  }
}

export default handleMessage
