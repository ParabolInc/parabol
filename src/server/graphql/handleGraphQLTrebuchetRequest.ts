import {
  ClientMessageTypes,
  OutgoingMessage,
  ServerMessageTypes
} from '@mattkrick/graphql-trebuchet-client'
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler'
import handleSubscribe from 'server/socketHandlers/handleSubscribe'
import relayUnsubscribe from 'server/utils/relayUnsubscribe'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import handleWRTCSignal from '@mattkrick/fast-rtc-swarm/server'

interface Options {
  persistedQueries?: {
    [key: string]: string
  }
  isQueryAllowed? (query: string, connectionContext: ConnectionContext): boolean
  clients?: any[]
}

const {GQL_START, GQL_STOP} = ServerMessageTypes
const {GQL_DATA, GQL_ERROR} = ClientMessageTypes

const handleGraphQLTrebuchetRequest = async (
  data: OutgoingMessage,
  connectionContext: ConnectionContext,
  options: Options = {}
) => {
  const {id: opId} = data
  switch (data.type as any) {
    case GQL_START:
      const {payload} = data
      if (!payload) {
        throw new Error('No payload provided')
      }
      const {variables, documentId} = payload

      const {persistedQueries, isQueryAllowed} = options
      let query: string | null | undefined = payload.query
      // const isQueryAllowed = options.isQueryAllowed || trueOp
      if (query) {
        if (persistedQueries) {
          if (isQueryAllowed && !isQueryAllowed(query, connectionContext)) {
            throw new Error('Custom queries are not allowed')
          }
        }
      } else {
        query = persistedQueries ? persistedQueries[documentId!] : null
        if (!query) {
          throw new Error('Invalid document ID')
        }
      }

      const params = {query, variables}
      if (query.startsWith('subscription')) {
        handleSubscribe(connectionContext, {id: opId, payload: params}).catch()
        return
      } else {
        const result = await wsGraphQLHandler(connectionContext, params)
        const messageType = result.data ? GQL_DATA : GQL_ERROR
        return {type: messageType, id: opId, payload: result}
      }
    case GQL_STOP:
      relayUnsubscribe(connectionContext.subs, opId)
      return
    case 'WRTC_SIGNAL':
      if (options.clients) {
        handleWRTCSignal(options.clients, connectionContext.socket, data.signal)
      }
      return
    default:
      throw new Error('No type provided')
  }
}

export default handleGraphQLTrebuchetRequest
