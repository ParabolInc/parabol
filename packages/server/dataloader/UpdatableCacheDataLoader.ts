import DataLoader, {CacheMap} from 'dataloader'

/**
 * Most loading functions return undefined for non-existing keys.
 * This class adds a convenience method for asserting the value exists for cases when we know the value exists because of DB constraints.
 */
class UpdatableCacheDataLoader<Key, Value, CacheKey = Key> extends DataLoader<
  Key,
  Value,
  CacheKey
> {
  private cache: CacheMap<CacheKey, Promise<Value>>
  private readonly cacheKeyFn: (key: Key) => CacheKey

  constructor(
    batchLoadFn: DataLoader.BatchLoadFn<Key, Value>,
    options?: DataLoader.Options<Key, Value, CacheKey>
  ) {
    const cacheMap = new Map()
    super(batchLoadFn, {cacheMap, ...options})
    this.cacheKeyFn = options?.cacheKeyFn ?? ((k: Key): CacheKey => k as unknown as CacheKey)
    this.cache = cacheMap
  }

  async updateCache(key: Key, newProperties: Partial<Value>) {
    const cacheKey = this.cacheKeyFn(key)
    const cachedValue = await this.cache?.get(cacheKey)

    if (cachedValue) {
      this.clear(key).prime(key, {...cachedValue, ...newProperties})
    }
  }
}

export default UpdatableCacheDataLoader
