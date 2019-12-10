/*
  This is a stateless function that can be broken out into its own microservice to scale
  It is used for all GraphQL queries, both trusted and untrusted
  It is NOT used for subscription source streams, since those require state
  It IS used to transform a source stream into a response stream
 */
import {ClientMessageTypes} from '@mattkrick/graphql-trebuchet-client'
import {createSourceEventStream, ExecutionResult} from 'graphql'
import {decode} from 'jsonwebtoken'
import {IAuthTokenPayload} from 'parabol-client/types/graphql'
import SubscriptionIterator from 'utils/SubscriptionIterator'
import AuthToken from '../database/types/AuthToken'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import sendMessage from '../socketHelpers/sendMessage'
import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'
import sendToSentry from '../utils/sendToSentry'
import DocumentCache from './DocumentCache'
import ResponseStream from './ResponseStream'
import publicSchema from './rootSchema'

export interface SubscribeRequest {
  connectionContext: ConnectionContext
  variables?: {[key: string]: any}
  docId?: string
  query?: string
  opId: string
  hideErrors?: boolean
}

export interface PubSubPayload {
  rootValue: {
    [subscriptionName: string]: {
      type: string
      [key: string]: any
    }
  }
  operationId: string
  mutatorId: string
}

const documentCache = new DocumentCache()
const {GQL_COMPLETE, GQL_DATA} = ClientMessageTypes

const subscribeGraphQL = async (req: SubscribeRequest) => {
  const {connectionContext, variables, docId, query, opId, hideErrors} = req
  const {id: socketId, authToken, socket} = connectionContext
  const document = docId ? await documentCache.fromID(docId) : documentCache.fromString(query!)
  if (!document) {
    if (!hideErrors) {
      sendToSentry(new Error(`DocumentID not found: ${docId}`))
    }
    return
  }
  const context = {socketId, authToken}
  const sourceStream = (await createSourceEventStream(
    publicSchema,
    document,
    {},
    context,
    variables
  )) as SubscriptionIterator<PubSubPayload>

  const {errors} = sourceStream as ExecutionResult
  if (errors) {
    if (!hideErrors) {
      sendToSentry(new Error(errors[0].message))
    }
    return
  }
  const responseStream = new ResponseStream(sourceStream, req)
  connectionContext.subs[opId] = responseStream
  // TODO PR definitelytyped
  for await (const payload of responseStream) {
    const {data} = payload
    if (data?.notificationSubscription?.__typename === 'AuthTokenPayload') {
      const jwt = (data.notificationSubscription as IAuthTokenPayload).id
      connectionContext.authToken = new AuthToken(decode(jwt) as any)
      // if auth changed, then we can't trust any of the subscriptions, so dump em all and resub for the client
      // delay it to guarantee that no matter when this is published, it is the last message on the mutation
      setTimeout(() => {
        relayUnsubscribeAll(connectionContext, {isResub: true})
      }, 1000)
    }
    sendMessage(socket, GQL_DATA, payload, opId)
  }
  const resubIdx = connectionContext.availableResubs.indexOf(opId)
  if (resubIdx !== -1) {
    // reinitialize the subscription
    subscribeGraphQL({...req, hideErrors: true}).catch()
    connectionContext.availableResubs.splice(resubIdx, 1)
  } else {
    sendMessage(socket, GQL_COMPLETE, undefined, opId)
  }
}

export default subscribeGraphQL
