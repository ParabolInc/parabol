import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import tracer from 'dd-trace'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import getGraphQLExecutor from '../utils/getGraphQLExecutor'
import relayUnsubscribe from '../utils/relayUnsubscribe'
import sanitizeGraphQLErrors from '../utils/sanitizeGraphQLErrors'
import subscribeGraphQL from './subscribeGraphQL'
export type GraphQLMessageType = 'data' | 'complete' | 'error'

const handleGraphQLTrebuchetRequest = async (
  data: OutgoingMessage,
  connectionContext: ConnectionContext
) => {
  const opId = data.id
  const {id: socketId, authToken, ip, subs} = connectionContext
  if (data.type === 'start') {
    const {payload} = data
    const {variables, documentId: docId, query} = payload
    if (!payload)
      return {
        type: 'error' as const,
        id: opId || '',
        payload: {errors: [{message: 'No payload provided'}]}
      }
    if (__PRODUCTION__ && !docId)
      return {
        type: 'error' as const,
        id: opId || '',
        payload: {errors: [{message: 'DocumentId not provided'}]}
      }

    const isSubscription = docId?.[0] === 's' || (!__PRODUCTION__ && query?.startsWith('subscription'))
    if (isSubscription) {
      subscribeGraphQL({docId, query, opId: opId!, variables, connectionContext})
      return
    }
    return tracer.trace('handleGraphQLTrebuchetRequest', async (span) => {
      const carrier = {}
      tracer.inject(span!, 'http_headers', carrier)
      try {
        const result = await getGraphQLExecutor().publish({
          docId,
          query,
          variables,
          socketId,
          authToken,
          ip,
          carrier
        })
        const safeResult = sanitizeGraphQLErrors(result)
        // TODO if multiple results, send GQL_DATA for all but the last
        const messageType = result.data ? 'complete' : 'error'
        return {type: messageType, id: opId, payload: safeResult} as const
      } catch (e) {
        return {
          type: 'error' as const,
          id: opId || '',
          payload: {errors: [{message: 'The request took too long'}]}
        }
      }
    })
  } else if (data.type === 'stop' && opId) {
    relayUnsubscribe(subs, opId)
  }
  return
}

export default handleGraphQLTrebuchetRequest
