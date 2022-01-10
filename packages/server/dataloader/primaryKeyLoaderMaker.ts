import DataLoader from 'dataloader'
import RootDataLoader from './RootDataLoader'
import normalizeRethinkDbResults from './normalizeRethinkDbResults'

/**
 * Register a loader for types loaded by their {id: string} field.
 *
 * This is specially useful for postgres loading functions, but can be used for other types as well.
 */
export function primaryKeyLoaderMaker<ReturnT extends {id: string}>(
  batchFn: (ids: readonly string[]) => Promise<ReturnT[]>
) {
  return (parent: RootDataLoader) => {
    return new DataLoader<string, ReturnT | undefined, string>(
      async (ids) => {
        const result = await batchFn(ids)
        return normalizeRethinkDbResults(ids, result)
      },
      {...parent.dataLoaderOptions}
    )
  }
}
