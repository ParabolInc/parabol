import NullableDataLoader from '../nullableDataLoader'

describe('NullableDataLoader', () => {
  let nullableDataLoader: NullableDataLoader<number, {id: number; name: string}, string>

  beforeEach(() => {
    const batchLoadFn = jest.fn((keys) =>
      Promise.resolve(keys.map((key: number) => ({id: key, name: `Name ${key}`})))
    )
    const options = {cacheKeyFn: (key: number) => `key:${key}`}
    nullableDataLoader = new NullableDataLoader(batchLoadFn, options)
  })

  it('should update the cache if cache exists', async () => {
    const key = 1
    await nullableDataLoader.loadNonNull(key)
    const newProperties = {name: 'newValue'}
    await nullableDataLoader.updateCache(key, newProperties)
    const reloadedItem = await nullableDataLoader.loadNonNull(key)
    expect(reloadedItem).toEqual({id: 1, name: 'newValue'})
  })

  it('should not prime the cache if cache does not exists', async () => {
    const key = 1
    const newProperties = {name: 'newValue'}
    await nullableDataLoader.updateCache(key, newProperties)
    const reloadedItem = await nullableDataLoader.loadNonNull(1)
    expect(reloadedItem).toEqual({id: 1, name: 'Name 1'})
  })
})
