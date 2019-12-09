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
import ConnectionContext from '../socketHelpers/ConnectionContext'
import sendMessage from '../socketHelpers/sendMessage'
import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'
import sendToSentry from '../utils/sendToSentry'
import AuthToken from '../database/types/AuthToken'
import DocumentCache from './DocumentCache'
import executeGraphQL from './executeGraphQL'
import publicSchema from './rootSchema'

interface SubscribeRequest {
  connectionContext: ConnectionContext
  variables?: {[key: string]: any}
  docId?: string
  query?: string
  opId: string
  reportErrors?: boolean
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
  const {connectionContext, variables, docId, query, opId, reportErrors} = req
  const {id: socketId, authToken, socket, ip} = connectionContext
  const document = docId ? await documentCache.fromID(docId) : documentCache.fromString(query!)
  const context = {socketId, authToken}
  const sourceStream = (await createSourceEventStream(
    publicSchema,
    document,
    {},
    context,
    variables
  )) as AsyncIterableIterator<PubSubPayload>

  const {errors} = sourceStream as ExecutionResult
  if (errors) {
    if (!reportErrors) {
      sendToSentry(new Error(errors[0].message))
    }
    return
  }

  const responseStream = {
    [Symbol.asyncIterator]() {
      return this
    },
    async next() {
      const sourceIter = await sourceStream.next()
      if (sourceIter.done) return sourceIter
      const {mutatorId, operationId: dataLoaderId, rootValue} = sourceIter.value
      if (mutatorId === socketId) return {value: undefined, done: false}
      const result = await executeGraphQL({
        docId,
        authToken,
        dataLoaderId,
        ip,
        query,
        variables,
        rootValue,
        socketId
      })
      if (result.errors) {
        sendToSentry(new Error(result.errors[0].message))
        return {value: undefined, done: false}
      }
      return {done: false, value: result}
    },
    return() {
      return Promise.resolve({done: true, value: undefined})
    },
    throw(error) {
      return Promise.resolve({done: true, value: error})
    }
  }

  // TODO PR definitelytyped
  for await (const payload of responseStream) {
    const {data} = payload
    if (data?.notificationSubscription?.__typename === 'AuthTokenPayload') {
      const jwt = (data.notificationSubscription as IAuthTokenPayload).id
      connectionContext.authToken = new AuthToken(decode(jwt) as any)
      // if auth changed, then we can't trust any of the subscriptions, so dump em all and resub for the client
      // delay it to guarantee that no matter when this is published, it is the last message on the mutation
      setTimeout(() => relayUnsubscribeAll(connectionContext, {isResub: true}), 1000)
    }
    sendMessage(socket, GQL_DATA, payload, opId)
  }
  const resubIdx = connectionContext.availableResubs.indexOf(opId)
  if (resubIdx !== -1) {
    // reinitialize the subscription
    subscribeGraphQL({...req, reportErrors: true}).catch()
    connectionContext.availableResubs.splice(resubIdx, 1)
  } else {
    sendMessage(socket, GQL_COMPLETE, undefined, opId)
  }
}

export default subscribeGraphQL
