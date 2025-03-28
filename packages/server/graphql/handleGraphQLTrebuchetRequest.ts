import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import tracer from 'dd-trace'
import type {InitialIncrementalExecutionResult} from 'graphql'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import getGraphQLExecutor from '../utils/getGraphQLExecutor'
import relayUnsubscribe from '../utils/relayUnsubscribe'
import subscribeGraphQL from './subscribeGraphQL'
export type GraphQLMessageType = 'data' | 'complete' | 'error'

const handleGraphQLTrebuchetRequest = async (
  data: OutgoingMessage,
  connectionContext: ConnectionContext,
  onResponse: (response: {type: GraphQLMessageType; id: string; payload: any}) => void
) => {
  const opId = data.id || ''
  const {id: socketId, authToken, ip, subs} = connectionContext
  if (data.type === 'start') {
    const {payload} = data
    const {variables, documentId: docId, query} = payload
    if (!payload)
      onResponse({
        type: 'error' as const,
        id: opId,
        payload: {errors: [{message: 'No payload provided'}]}
      })
    if (__PRODUCTION__ && !docId)
      onResponse({
        type: 'error' as const,
        id: opId,
        payload: {errors: [{message: 'DocumentId not provided'}]}
      })

    const isSubscription = __PRODUCTION__ ? docId![0] === 's' : query?.startsWith('subscription')
    if (isSubscription) {
      subscribeGraphQL({docId, query, opId, variables, connectionContext})
      return
    }
    return tracer.trace('handleGraphQLTrebuchetRequest', async (span) => {
      const carrier = {}
      tracer.inject(span!, 'http_headers', carrier)
      getGraphQLExecutor().publish(
        {
          docId,
          query,
          variables,
          socketId,
          authToken,
          ip,
          carrier
        },
        (result) => {
          // Sending unsantized results as a trial to keep query responses simple
          // const safeResult = sanitizeGraphQLErrors(result)
          const messageType = (result as InitialIncrementalExecutionResult).hasNext
            ? 'data'
            : result.data
              ? 'complete'
              : 'error'
          onResponse({type: messageType, id: opId, payload: result})
        }
      )
    })
  } else if (data.type === 'stop' && opId) {
    relayUnsubscribe(subs, opId)
  }
  return
}

export default handleGraphQLTrebuchetRequest
