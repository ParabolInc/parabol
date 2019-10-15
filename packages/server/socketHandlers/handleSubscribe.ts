import {ClientMessageTypes} from '@mattkrick/graphql-trebuchet-client'
import {ExecutionResult, parse, subscribe} from 'graphql'
import Schema from '../graphql/rootSchema'
import sendMessage from '../socketHelpers/sendMessage'
import {getUserId} from '../utils/authorization'
import relayUnsubscribe from '../utils/relayUnsubscribe'
import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'
import RethinkDataLoader from '../utils/RethinkDataLoader'
import sendToSentry from '../utils/sendToSentry'
import {ExecutionResultDataDefault} from 'graphql/execution/execute'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import AuthToken from '../database/types/AuthToken'
import {IAuthTokenPayload} from 'parabol-client/types/graphql'
import {decode} from 'jsonwebtoken'

const {GQL_COMPLETE, GQL_DATA, GQL_ERROR} = ClientMessageTypes

const isAsyncIterator = (
  result: AsyncIterator<any> | ExecutionResult<any>
): result is AsyncIterator<any> => {
  return !('errors' in result)
}

const trySubscribe = async (authToken, parsedMessage, socketId, sharedDataLoader, isResub) => {
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken, {cache: false}))
  const {
    payload: {query, variables}
  } = parsedMessage
  const context = {authToken, dataLoader, socketId}
  const document = parse(query)
  try {
    const result = await subscribe(Schema, document, {}, context, variables)
    if (isAsyncIterator(result)) {
      return {asyncIterator: result}
    }
    // squelch errors for resub, we expect a few errors & the client doesn't need to know about them
    return isResub ? {} : {errors: result.errors}
  } catch (e) {
    return isResub ? {} : {errors: [{message: e.message}]}
  }
}

interface Options {
  isResub?: boolean
}

interface ParsedMessage {
  id: string
  payload: {
    query: string
    variables: object | undefined
  }
}

const handleSubscribe = async (
  connectionContext: ConnectionContext,
  parsedMessage: ParsedMessage,
  options: Options = {}
) => {
  const {id: socketId, authToken, socket, sharedDataLoader} = connectionContext
  const {id: opId} = parsedMessage
  const {isResub} = options
  if (connectionContext.subs[opId]) {
    // subscription already exists, restart it
    relayUnsubscribe(connectionContext.subs, opId)
  }

  connectionContext.subs[opId] = {status: 'pending'}
  const {asyncIterator, errors} = await trySubscribe(
    authToken,
    parsedMessage,
    socketId,
    sharedDataLoader,
    isResub
  )
  if (!asyncIterator) {
    if (errors) {
      const {query, variables} = parsedMessage.payload
      const viewerId = getUserId(authToken)
      sendToSentry(new Error(errors[0].message), {
        tags: {query: query.slice(0, 40), variables: JSON.stringify(variables)},
        userId: viewerId
      })
      sendMessage(socket, GQL_ERROR, {errors}, opId)
    }
    return
  }
  connectionContext.subs[opId] = {
    asyncIterator
  }
  // Use this to kick clients out of the sub
  // setTimeout(() => {
  //  asyncIterator.return();
  //  console.log('sub ended', opId)
  // }, 5000)

  // typecast pending PR: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/36917
  for await (const payload of asyncIterator as AsyncIterableIterator<
    ExecutionResult<ExecutionResultDataDefault>
  >) {
    const {data} = payload
    if (
      data &&
      data.notificationSubscription &&
      data.notificationSubscription.__typename === 'AuthTokenPayload'
    ) {
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
    handleSubscribe(connectionContext, parsedMessage, {isResub: true}).catch()
    connectionContext.availableResubs.splice(resubIdx, 1)
  } else {
    sendMessage(socket, GQL_COMPLETE, undefined, opId)
  }
}

export default handleSubscribe
