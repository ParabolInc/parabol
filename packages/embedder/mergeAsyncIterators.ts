import {ParseInt} from '../client/types/generics'

// can remove PromiseCapability after TS v5.4.2
type PromiseCapability<T> = {
  resolve: (value: T) => void
  reject: (reason?: any) => void
  promise: Promise<T>
}

type UnYield<T> = T extends IteratorYieldResult<infer U> ? U : never
type Result<T extends AsyncIterator<any>> = UnYield<Awaited<ReturnType<T['next']>>>

// Promise.race has a memory leak
// To avoid: https://github.com/tc39/proposal-async-iterator-helpers/issues/15#issuecomment-1937011820
export function mergeAsyncIterators<T extends AsyncIterator<any>[] | []>(iterators: T) {
  type ResultThunk = () => [number, Result<T[number]>]
  let count = iterators.length as number
  let capability: PromiseCapability<ResultThunk | null> | undefined
  const queuedResults: ResultThunk[] = []
  const getNext = async (idx: number, iterator: T[number]) => {
    try {
      const next = await iterator.next()
      if (next.done) {
        if (--count === 0 && capability !== undefined) {
          capability.resolve(null)
        }
      } else {
        resolveResult(() => {
          void getNext(idx, iterator)
          return [idx, next.value]
        })
      }
    } catch (error) {
      resolveResult(() => {
        throw error
      })
    }
  }
  const resolveResult = (resultThunk: ResultThunk) => {
    if (capability === undefined) {
      queuedResults.push(resultThunk)
    } else {
      capability.resolve(resultThunk)
    }
  }

  // Begin all iterators
  for (const [idx, iterable] of iterators.entries()) {
    void getNext(idx, iterable)
  }

  const it: AsyncIterableIterator<{[P in keyof T]: [ParseInt<`${P}`>, Result<T[P]>]}[number]> = {
    [Symbol.asyncIterator]: () => it,
    next: async () => {
      const nextQueuedResult = queuedResults.shift()
      if (nextQueuedResult !== undefined) {
        return {done: false as const, value: nextQueuedResult()}
      }
      if (count === 0) {
        return {done: true as const, value: undefined}
      }

      // Promise.withResolvers() is not yet implemented in node
      capability = {
        resolve: undefined as any,
        reject: undefined as any,
        promise: undefined as any
      }
      capability.promise = new Promise((res, rej) => {
        capability!.resolve = res
        capability!.reject = rej
      })
      const nextResult = await capability.promise
      if (nextResult === null) {
        return {done: true as const, value: undefined}
      } else {
        capability = undefined
        return {done: false as const, value: nextResult()}
      }
    },
    return: async () => {
      await Promise.allSettled(iterators.map((iterator) => iterator.return?.()))
      return {done: true as const, value: undefined}
    },
    throw: async () => {
      await Promise.allSettled(iterators.map((iterator) => iterator.return?.()))
      return {done: true as const, value: undefined}
    }
  }
  return it
}
