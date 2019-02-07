import {ClientMessageTypes, ServerMessageTypes} from '@mattkrick/graphql-trebuchet-client'
import wsRelaySubscribeHandler from 'server/socketHandlers/wsRelaySubscribeHandler'
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler'
import relayUnsubscribe from 'server/utils/relayUnsubscribe'
import isQueryProvided from 'server/graphql/isQueryProvided'
import isSubscriptionPayload from 'server/graphql/isSubscriptionPayload'
import sendToSentry from 'server/utils/sendToSentry'
import {getUserId} from 'server/utils/authorization'

const {GQL_START, GQL_STOP} = ServerMessageTypes
const {GQL_DATA, GQL_ERROR} = ClientMessageTypes
export default (sharedDataLoader, rateLimiter, sseClients) => async (req, res) => {
  const {id: opId, type, payload} = req.body
  const connectionId = req.headers['x-correlation-id']
  const authToken = req.user || {}
  const connectionContext = connectionId
    ? sseClients[connectionId]
    : {sharedDataLoader, rateLimiter, authToken}
  if (!connectionContext) {
    // SSE req provided, but no cached Response
    res.send('SSE Response not found')
    return
  }
  if (connectionId && connectionContext.authToken.sub !== authToken.sub) {
    const viewerId = getUserId(authToken)
    sendToSentry(new Error('Security: Spoofed SSE connectionId'), {userId: viewerId})
    // quietly fail for cheaters
    res.sendStatus(200)
  }

  if (type === GQL_START) {
    if (!isQueryProvided(payload)) {
      // no need to be user friendly because users aren't hitting this API with bespoke queries
      res.send('No payload provided')
      return
    }
    if (isSubscriptionPayload(payload)) {
      wsRelaySubscribeHandler(connectionContext, req.body)
      res.sendStatus(200)
    } else {
      const result = await wsGraphQLHandler(connectionContext, payload)
      const messageType = result.data ? GQL_DATA : GQL_ERROR
      res.send({type: messageType, id: opId, payload: result})
    }
  } else if (type === GQL_STOP) {
    relayUnsubscribe(connectionContext.subs, opId)
  }
}
