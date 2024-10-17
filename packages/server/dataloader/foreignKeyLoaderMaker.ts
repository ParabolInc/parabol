import DataLoader from 'dataloader'
import NullableDataLoader from './NullableDataLoader'
import RootDataLoader, {RegisterDependsOn} from './RootDataLoader'
import UpdatableCacheDataLoader from './UpdatableCacheDataLoader'
import * as primaryKeyLoaderMakers from './primaryKeyLoaderMakers'

type LoaderMakers = typeof primaryKeyLoaderMakers
type LoaderKeys = keyof LoaderMakers
type Loader<LoaderName extends LoaderKeys> = ReturnType<LoaderMakers[LoaderName]>
type LoaderType<LoaderName extends LoaderKeys> =
  Loader<LoaderName> extends NullableDataLoader<any, infer T, any> ? NonNullable<T> : any

/**
 * Used to register loaders for types by foreign key.
 *
 * This is intended for types which already have a {@link primaryKeyLoaderMaker} defined.
 * When an item is loaded via this loader, the primary loader will be primed with the result as well.
 * It reflects a one to many relationship, i.e. for each key passed, an array will be returned.
 */

export function foreignKeyLoaderMaker<
  LoaderName extends LoaderKeys,
  T extends LoaderType<LoaderName>,
  KeyName extends keyof T
>(
  primaryLoaderKey: LoaderName,
  foreignKey: KeyName,
  fetchFn: (keys: readonly T[KeyName][]) => Promise<(T & {id?: string | number})[]>
) {
  type KeyValue = T[KeyName]
  return (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
    dependsOn(primaryLoaderKey)
    const primaryLoader = parent.get(primaryLoaderKey) as DataLoader<any, T, any>
    return new UpdatableCacheDataLoader<KeyValue, T[], KeyValue>(
      async (ids) => {
        const items = await fetchFn(ids)
        items.forEach((item) => {
          const key = item?.id
          if (key) {
            primaryLoader.clear(key).prime(key, item)
          }
        })
        return ids.map((id) => items.filter((item) => item && item[foreignKey] === id))
      },
      {
        ...parent.dataLoaderOptions
      }
    )
  }
}
