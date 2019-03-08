import {ClientMessageTypes} from '@mattkrick/graphql-trebuchet-client'
import {ExecutionResult, parse, subscribe} from 'graphql'
import {forAwaitEach} from 'iterall'
import Schema from 'server/graphql/rootSchema'
import sendMessage from 'server/socketHelpers/sendMessage'
import {getUserId} from 'server/utils/authorization'
import maybeSendNewAuthToken from 'server/utils/maybeSendNewAuthToken'
import relayUnsubscribe from 'server/utils/relayUnsubscribe'
import relayUnsubscribeAll from 'server/utils/relayUnsubscribeAll'
import RethinkDataLoader from 'server/utils/RethinkDataLoader'
import sendToSentry from 'server/utils/sendToSentry'

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

const handleSubscribe = async (connectionContext, parsedMessage, options: Options = {}) => {
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
      sendToSentry(new Error(errors[0].message), {tags: {query, variables}, userId: viewerId})
      sendMessage(socket, GQL_ERROR, {errors}, opId)
    }
    return
  }
  connectionContext.subs[opId] = {
    asyncIterator
  }
  const iterableCb = (payload) => {
    const changedAuth = maybeSendNewAuthToken(connectionContext, payload)
    if (changedAuth) {
      // if auth changed, then we can't trust any of the subscriptions, so dump em all and resub for the client
      // delay it to guarantee that no matter when this is published, it is the last message on the mutation
      setTimeout(() => relayUnsubscribeAll(connectionContext, {isResub: true}), 1000)
      return
    }
    sendMessage(socket, GQL_DATA, payload, opId)
  }

  // Use this to kick clients out of the sub
  // setTimeout(() => {
  //  asyncIterator.return();
  //  console.log('sub ended', opId)
  // }, 5000)
  await forAwaitEach(asyncIterator as any, iterableCb)
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
