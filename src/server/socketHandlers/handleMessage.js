import {ServerMessageTypes, ClientMessageTypes} from '@mattkrick/graphql-trebuchet-client'
import handleDisconnect from 'server/socketHandlers/handleDisconnect'
import sendMessage from 'server/socketHelpers/sendMessage'
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler'
import wsRelaySubscribeHandler from 'server/socketHandlers/wsRelaySubscribeHandler'
import relayUnsubscribe from 'server/utils/relayUnsubscribe'
import isQueryProvided from 'server/graphql/isQueryProvided'
import isSubscriptionPayload from 'server/graphql/isSubscriptionPayload'
import {Events} from '@mattkrick/trebuchet-client'
import handleWRTCSignal from '@mattkrick/fast-rtc-swarm/server'

const {GQL_START, GQL_STOP} = ServerMessageTypes
const {GQL_DATA, GQL_ERROR} = ClientMessageTypes
const handleMessage = (connectionContext, wss) => async (message) => {
  const {socket, subs} = connectionContext
  // catch raw, non-graphql protocol messages here
  if (message === Events.KEEP_ALIVE) {
    connectionContext.isAlive = true
    return
  }

  let parsedMessage
  try {
    parsedMessage = JSON.parse(message)
  } catch (e) {
    /*
     * Invalid frame payload data
     * The endpoint is terminating the connection because a message was received that contained inconsistent data
     * (e.g., non-UTF-8 data within a text message).
     */
    handleDisconnect(connectionContext, {exitCode: 1007})()
    return
  }

  const {id: opId, type, payload} = parsedMessage
  // this GQL_START logic will be simplified when we move to persisted queries
  if (type === GQL_START) {
    if (!isQueryProvided(payload)) {
      sendMessage(socket, GQL_ERROR, {errors: [{message: 'No payload provided'}]}, opId)
      return
    }
    if (isSubscriptionPayload(payload)) {
      wsRelaySubscribeHandler(connectionContext, parsedMessage)
    } else {
      const result = await wsGraphQLHandler(connectionContext, parsedMessage.payload)
      const messageType = result.data ? GQL_DATA : GQL_ERROR
      sendMessage(socket, messageType, result, opId)
    }
  } else if (type === GQL_STOP) {
    relayUnsubscribe(subs, opId)
  } else if (type === 'WRTC_SIGNAL') {
    handleWRTCSignal(wss.clients, socket, parsedMessage.signal)
  }
}

export default handleMessage
