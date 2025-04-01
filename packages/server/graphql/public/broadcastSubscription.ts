import type SubscriptionIterator from '../../utils/SubscriptionIterator'
import getDataLoader from '../getDataLoader'
import type {InternalContext} from '../graphql'

export const broadcastSubscription = (iter: SubscriptionIterator, context: InternalContext) => {
  return {
    async next() {
      const sourceIter = await iter.next()
      if (sourceIter.done) return sourceIter
      const {mutatorId, operationId} = sourceIter.value
      if (mutatorId === context.socketId) return this.next()
      // use the same dataloader that the mutation used to avoid hitting the DB
      console.log('setting dataloader to', operationId)
      context.dataLoader = await getDataLoader(operationId)
      return {done: false, value: sourceIter.value.rootValue}
    },
    return() {
      return iter.return()
    },
    throw(error: unknown) {
      return iter.throw(error)
    },
    [Symbol.asyncIterator]() {
      return this
    }
  } as AsyncIterableIterator<any>
}
