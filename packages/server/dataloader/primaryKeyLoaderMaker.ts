import normalizeResults from './normalizeResults'
import NullableDataLoader from './NullableDataLoader'
import RootDataLoader from './RootDataLoader'

/**
 * Register a loader for types loaded by their {id: string} field.
 *
 * This is specially useful for postgres loading functions, but can be used for other types as well.
 */
export function primaryKeyLoaderMaker<KeyT extends string | number, ReturnT extends {id: KeyT}>(
  batchFn: (ids: readonly KeyT[]) => Promise<ReturnT[]>
) {
  return (parent: RootDataLoader) => {
    return new NullableDataLoader<KeyT, ReturnT, KeyT>(
      async (ids) => {
        const result = await batchFn(ids)
        return normalizeResults(ids, result)
      },
      {...parent.dataLoaderOptions}
    )
  }
}
