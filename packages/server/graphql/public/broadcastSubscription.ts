import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import type SubscriptionIterator from '../../utils/SubscriptionIterator'
import getDataLoader from '../getDataLoader'
import type {InternalContext} from '../graphql'

export const broadcastSubscription = (iter: SubscriptionIterator, context: InternalContext) => {
  // `done` short-circuits next() once return() or throw() has fired, so no
  // further iter.next() calls are made and the wrapper's closures release the
  // upstream iterator on the next GC pass instead of being pinned by an
  // in-flight pull.
  let done = false
  return {
    async next() {
      if (done) return {done: true as const, value: undefined}
      // A single subscription can skip many self-origin messages in a row; a
      // while-loop avoids building an arbitrarily deep recursive promise chain.
      while (!done) {
        const sourceIter = await iter.next()
        if (sourceIter.done) {
          done = true
          return sourceIter
        }
        const {mutatorId, operationId} = sourceIter.value
        if (mutatorId === context.socketId) continue
        if (operationId) {
          // use the same dataloader that the mutation used to avoid hitting the DB
          context.dataLoader = await getDataLoader(operationId)
        } else {
          // published outside a mutation (e.g. a socket disconnecting) or to self (e.g. a new auth token)
          // dispose only drops it from the cache that shares dataloaders by id, which nothing needs for this one
          context.dataLoader = getNewDataLoader('broadcastSubscription')
          context.dataLoader.dispose()
        }
        return {done: false, value: sourceIter.value.rootValue}
      }
      return {done: true as const, value: undefined}
    },
    return() {
      done = true
      return iter.return()
    },
    throw(error: unknown) {
      done = true
      return iter.throw(error)
    },
    [Symbol.asyncIterator]() {
      return this
    }
  } as AsyncIterableIterator<any>
}
