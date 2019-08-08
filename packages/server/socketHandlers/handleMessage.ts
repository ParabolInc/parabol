import {ClientMessageTypes} from '@mattkrick/graphql-trebuchet-client'
import {Data, Events} from '@mattkrick/trebuchet-client'
import handleDisconnect from './handleDisconnect'
import sendMessage from '../socketHelpers/sendMessage'
import handleGraphQLTrebuchetRequest from '../graphql/handleGraphQLTrebuchetRequest'
import isQueryAllowed from '../graphql/isQueryAllowed'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import {getUserId} from '../utils/authorization'
import sendToSentry from '../utils/sendToSentry'
import handleSignal, {UWebSocket} from '../wrtc/signalServer/handleSignal'
import validateInit from '../wrtc/signalServer/validateInit'
import getQueryString from '../graphql/getQueryString'
import keepAlive from '../socketHelpers/keepAlive'

const {GQL_ERROR} = ClientMessageTypes

const handleMessage = (connectionContext: ConnectionContext) => async (message: Data) => {
  const {socket} = connectionContext
  keepAlive(connectionContext)
  // catch raw, non-graphql protocol messages here
  if (message === Events.KEEP_ALIVE) {
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
    if (validateInit(socket as UWebSocket, parsedMessage.signal, connectionContext.authToken)) {
      handleSignal(socket as UWebSocket, parsedMessage.signal)
    }
    return
  }
  try {
    const response = await handleGraphQLTrebuchetRequest(parsedMessage, connectionContext, {
      getQueryString,
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
