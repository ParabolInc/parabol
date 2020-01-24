import {OutgoingMessage} from '@mattkrick/graphql-trebuchet-client'
import PROD from '../PROD'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import relayUnsubscribe from '../utils/relayUnsubscribe'
import sanitizeGraphQLErrors from '../utils/sanitizeGraphQLErrors'
import sendToSentry from '../utils/sendToSentry'
import executeGraphQL from './executeGraphQL'
import subscribeGraphQL from './subscribeGraphQL'

type TrebuchetServerResult = Promise<{
  type: 'data' | 'complete' | 'error'
  id?: string
  payload: {data?: any; errors?: {message: string; path?: string[]}[]}
} | void>

const IGNORE_MUTATIONS = ['segmentEventTrack', 'updateDragLocation', 'setAppLocation']

const handleGraphQLTrebuchetRequest = async (
  data: OutgoingMessage,
  connectionContext: ConnectionContext
): TrebuchetServerResult => {
  const opId = data.id!
  const {id: socketId, authToken, ip, subs} = connectionContext
  if (data.type === 'start') {
    const {payload} = data
    if (!payload)
      return {type: 'error', id: opId, payload: {errors: [{message: 'No payload provided'}]}}
    const {variables, documentId: docId, query} = payload
    if (PROD && !docId)
      return {type: 'error', id: opId, payload: {errors: [{message: 'DocumentId not provided'}]}}
    const isSubscription = PROD ? docId![0] === 's' : query?.startsWith('subscription')
    if (isSubscription) {
      subscribeGraphQL({docId, query, opId, variables, connectionContext})
      return
    }
    const result = await executeGraphQL({docId, query, variables, socketId, authToken, ip})
    if (result.errors) {
      const [firstError] = result.errors
      const safeError = new Error(firstError.message)
      safeError.stack = firstError.stack
      sendToSentry(safeError)
    }
    if (result.data && IGNORE_MUTATIONS.includes(Object.keys(result.data)[0])) return
    const safeResult = sanitizeGraphQLErrors(result)
    // TODO if multiple results, send GQL_DATA for all but the last
    const messageType = result.data ? 'complete' : 'error'
    return {type: messageType, id: opId, payload: safeResult as any}
  } else if (data.type === 'stop') {
    relayUnsubscribe(subs, opId)
  }
  return
}

export default handleGraphQLTrebuchetRequest
