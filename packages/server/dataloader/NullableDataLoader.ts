import DataLoader from 'dataloader'
import UpdatableCacheDataLoader from './UpdatableCacheDataLoader'

/**
 * Most loading functions return undefined for non-existing keys.
 * This class adds a convenience method for asserting the value exists for cases when we know the value exists because of DB constraints.
 */
class NullableDataLoader<Key, Value, CacheKey = Key> extends UpdatableCacheDataLoader<
  Key,
  Value | undefined,
  CacheKey
> {
  constructor(
    batchLoadFn: DataLoader.BatchLoadFn<Key, Value | undefined>,
    options?: DataLoader.Options<Key, Value | undefined, CacheKey>
  ) {
    super(batchLoadFn, options)
  }

  async loadNonNull(key: Key): Promise<Value> {
    const value = await this.load(key)
    if (value === undefined) {
      throw new Error('Non-nullable value is undefined')
    }
    return value
  }
}

export default NullableDataLoader
