import type SubscriptionIterator from '../../utils/SubscriptionIterator'

export const broadcastSubscription = (iter: SubscriptionIterator, socketId: string) => {
  return {
    async next() {
      const sourceIter = await iter.next()
      if (sourceIter.done) return sourceIter
      const {mutatorId} = sourceIter.value
      if (mutatorId === socketId) return this.next()
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
