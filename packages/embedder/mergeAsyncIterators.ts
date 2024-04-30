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
export function mergeAsyncIterators<T extends AsyncIterator<any>[] | []>(
  iterators: T
): AsyncIterableIterator<{[P in keyof T]: [ParseInt<`${P}`>, Result<T[P]>]}[number]> {
  return (async function* () {
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

    try {
      // Begin all iterators
      for (const [idx, iterable] of iterators.entries()) {
        void getNext(idx, iterable)
      }

      // Delegate to iterables as results complete
      while (true) {
        while (true) {
          const nextQueuedResult = queuedResults.shift()
          if (nextQueuedResult === undefined) {
            break
          } else {
            yield nextQueuedResult()
          }
        }
        if (count === 0) {
          break
        } else {
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
            break
          } else {
            capability = undefined
            yield nextResult()
          }
        }
      }
    } catch (err) {
      // Unwind remaining iterators on failure
      await Promise.allSettled(iterators.map((iterator) => iterator.return?.()))
      throw err
    } finally {
      // Unwind remaining iterators on success
      await Promise.allSettled(iterators.map((iterator) => iterator.return?.()))
    }
  })()
}
