import {mergeAsyncIterators} from '../../../embedder/mergeAsyncIterators'

const countUntil = (limit: number, gate: Promise<void>) => {
  let count = 0
  return {
    next: async (): Promise<IteratorResult<number>> => {
      await gate
      count += 1
      return count > limit ? {done: true, value: undefined} : {done: false, value: count}
    }
  }
}

it('keeps every iterator going when several finish a step at the same moment', async () => {
  const iterators = [countUntil(3, Promise.resolve()), countUntil(3, Promise.resolve())]
  const sharedGate = Promise.resolve()
  iterators.push(countUntil(3, sharedGate), countUntil(3, sharedGate), countUntil(3, sharedGate))
  const stepsByIterator = iterators.map(() => 0)
  for await (const [idx] of mergeAsyncIterators(iterators) as AsyncIterable<[number, number]>) {
    stepsByIterator[idx]! += 1
  }
  expect(stepsByIterator).toEqual([3, 3, 3, 3, 3])
})

it('finishes when every iterator is done', async () => {
  const results: number[] = []
  const merged = mergeAsyncIterators([countUntil(1, Promise.resolve())])
  for await (const [, value] of merged as AsyncIterable<[number, number]>) results.push(value)
  expect(results).toEqual([1])
})
