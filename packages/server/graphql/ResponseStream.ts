import {ExecutionResult} from 'graphql'
import sendToSentry from '../utils/sendToSentry'
import executeGraphQL from './executeGraphQL'
import SubscriptionIterator from '../utils/SubscriptionIterator'
import {SubscribeRequest} from './subscribeGraphQL'

export default class ResponseStream implements AsyncIterableIterator<ExecutionResult> {
  sourceStream: SubscriptionIterator
  req: SubscribeRequest

  constructor(sourceStream: SubscriptionIterator, req: SubscribeRequest) {
    this.sourceStream = sourceStream
    this.req = req
  }

  [Symbol.asyncIterator]() {
    return this
  }
  async next() {
    const sourceIter = await this.sourceStream.next()
    if (sourceIter.done) return sourceIter
    const {mutatorId, operationId: dataLoaderId, rootValue} = sourceIter.value
    const {connectionContext, query, variables, docId} = this.req
    const {id: socketId, authToken, ip} = connectionContext
    if (mutatorId === socketId) return this.next()
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
      return this.next()
    }
    return {done: false, value: result}
  }
  return() {
    this.sourceStream.return()
    return Promise.resolve({done: true as true, value: undefined})
  }
  throw(error) {
    this.sourceStream.throw(error)
    return Promise.resolve({done: true, value: error})
  }
}
