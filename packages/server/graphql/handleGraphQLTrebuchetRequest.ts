import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import tracer from 'dd-trace'
import PROD from '../PROD'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import {getUserId} from '../utils/authorization'
import getGraphQLExecutor from '../utils/getGraphQLExecutor'
import relayUnsubscribe from '../utils/relayUnsubscribe'
import sanitizeGraphQLErrors from '../utils/sanitizeGraphQLErrors'
import sendToSentry from '../utils/sendToSentry'
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
    if (PROD && !docId)
      return {
        type: 'error' as const,
        id: opId || '',
        payload: {errors: [{message: 'DocumentId not provided'}]}
      }

    const isSubscription = PROD ? docId![0] === 's' : query?.startsWith('subscription')
    if (isSubscription) {
      subscribeGraphQL({docId, query, opId: opId!, variables, connectionContext})
      return
    }
    try {
      return tracer.trace('handleGraphQLTrebuchetRequest', async (span) => {
        const carrier = {}
        tracer.inject(span!, 'http_headers', carrier)
        const result = await getGraphQLExecutor().publish({
          docId,
          query,
          variables,
          socketId,
          authToken,
          ip,
          carrier
        })
        if (result.errors?.[0]) {
          const [firstError] = result.errors
          const safeError = new Error(firstError.message)
          safeError.stack = firstError.stack
          sendToSentry(safeError)
        }
        const safeResult = sanitizeGraphQLErrors(result)
        // TODO if multiple results, send GQL_DATA for all but the last
        const messageType = result.data ? 'complete' : 'error'
        return {type: messageType, id: opId, payload: safeResult} as const
      })
    } catch (e) {
      if (e instanceof Error && e.message === 'TIMEOUT') {
        sendToSentry(new Error('GQL executor took too long to respond'), {
          userId: getUserId(authToken),
          tags: {
            authToken: JSON.stringify(authToken),
            docId: docId || '',
            query: query || '',
            variables: JSON.stringify(variables)
          }
        })
        return {
          type: 'error' as const,
          id: opId || '',
          payload: {errors: [{message: 'The request took too long'}]}
        }
      }
      const viewerId = getUserId(authToken)
      const error =
        e instanceof Error ? e : new Error(`GQL executor failed to publish. docId: ${docId}`)
      sendToSentry(error, {userId: viewerId})
    }
  } else if (data.type === 'stop' && opId) {
    relayUnsubscribe(subs, opId)
  }
  return
}

export default handleGraphQLTrebuchetRequest
