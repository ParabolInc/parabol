import {
  ClientMessageTypes,
  OutgoingMessage,
  ServerMessageTypes
} from '@mattkrick/graphql-trebuchet-client'
import executeGraphQL from './executeGraphQL'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import relayUnsubscribe from '../utils/relayUnsubscribe'
import sanitizeGraphQLErrors from '../utils/sanitizeGraphQLErrors'
import sendToSentry from '../utils/sendToSentry'
import subscribeGraphQL from './subscribeGraphQL'

const {GQL_START, GQL_STOP} = ServerMessageTypes
const {GQL_DATA, GQL_ERROR} = ClientMessageTypes
const IGNORE_MUTATIONS = ['updateDragLocation']
const PROD = process.env.NODE_ENV === 'production'

const handleGraphQLTrebuchetRequest = async (
  data: OutgoingMessage,
  connectionContext: ConnectionContext
) => {
  const opId = data.id!
  const {id: socketId, authToken, ip, subs} = connectionContext
  if (data.type === GQL_START) {
    const {payload} = data
    if (!payload)
      return {type: GQL_ERROR, id: opId, payload: {errors: [new Error('No payload provided')]}}
    const {variables, documentId: docId, query} = payload
    if (PROD && !docId)
      return {type: GQL_ERROR, id: opId, payload: {errors: [new Error('DocumentId not provided')]}}
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
    const messageType = result.data ? GQL_DATA : GQL_ERROR
    return {type: messageType, id: opId, payload: safeResult}
  } else if (data.type === GQL_STOP) {
    relayUnsubscribe(subs, opId)
  }
  return
}

export default handleGraphQLTrebuchetRequest
