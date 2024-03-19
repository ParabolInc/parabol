// can remove PromiseCapability after TS v5.4.2
type PromiseCapability<T> = {
  resolve: (value: T) => void
  reject: (reason?: any) => void
  promise: Promise<T>
}

// typescript intrinsics for iterables don't work like the do for promises yet, please ignore hackery
type UnYield<T> = T extends IteratorYieldResult<infer U> ? U : never
type UnIt<T extends AsyncIterator<any>> = UnYield<Awaited<ReturnType<T['next']>>>

// Promise.race has a memory leak
// To avoid: https://github.com/tc39/proposal-async-iterator-helpers/issues/15#issuecomment-1937011820
export function mergeAsyncIterators<
  T1 extends AsyncIterator<any>,
  T2 extends AsyncIterator<any>,
  K1 = UnIt<T1>,
  K2 = UnIt<T2>
>(iterables: [T1, T2]) {
  return (async function* () {
    type AcceptThunk = () => [0, K1] | [1, K2]
    let count = iterables.length as number
    let capability: PromiseCapability<AcceptThunk | null> | undefined
    const iterators: AsyncIterator<any>[] = []
    const queue: AcceptThunk[] = []
    const accept = async (idx: 0 | 1, iterator: AsyncIterator<any>) => {
      try {
        const next = await iterator.next()
        if (next.done) {
          if (--count === 0 && capability !== undefined) {
            capability.resolve(null)
          }
        } else {
          push(() => {
            void accept(idx, iterator)
            return [idx, next.value] as any
          })
        }
      } catch (error) {
        push(() => {
          throw error
        })
      }
    }
    const push = (acceptThunk: AcceptThunk) => {
      if (capability === undefined) {
        queue.push(acceptThunk)
      } else {
        capability.resolve(acceptThunk)
      }
    }

    try {
      // Begin all iterators
      for (const [idx, iterable] of iterables.entries()) {
        const iterator = iterable[Symbol.asyncIterator]()
        iterators.push(iterator)
        void accept(idx as 0 | 1, iterator)
      }

      // Delegate to iterables as results complete
      while (true) {
        while (true) {
          const next = queue.shift()
          if (next === undefined) {
            break
          } else {
            yield next()
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
          const next = await capability.promise
          if (next === null) {
            break
          } else {
            capability = undefined
            yield next()
          }
        }
      }
    } catch (err) {
      // Unwind remaining iterators on failure
      try {
        await Promise.all(iterators.map((iterator) => iterator.return?.()))
      } catch {}
      throw err
    }
  })() as AsyncGenerator<[0, K1] | [1, K2]>
}
