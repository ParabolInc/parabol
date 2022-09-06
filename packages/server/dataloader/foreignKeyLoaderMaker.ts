import DataLoader from 'dataloader'
import * as primaryKeyLoaderMakers from './primaryKeyLoaderMakers'
import RootDataLoader from './RootDataLoader'

type LoaderMakers = typeof primaryKeyLoaderMakers
type LoaderKeys = keyof LoaderMakers
type Loader<LoaderName extends LoaderKeys> = ReturnType<LoaderMakers[LoaderName]>
type LoaderType<LoaderName extends LoaderKeys> = Loader<LoaderName> extends DataLoader<
  any,
  infer T,
  any
>
  ? NonNullable<T>
  : any

/**
 * Used to register loaders for types by foreign key.
 *
 * This is intended for types which already have a {@link primaryKeyLoaderMaker} defined.
 * When an item is loaded via this loader, the primary loader will be primed with the result as well.
 * It reflects a one to many relationship, i.e. for each key passed, an array will be returned.
 */
export function foreignKeyLoaderMaker<
  LoaderName extends LoaderKeys,
  KeyName extends keyof LoaderType<LoaderName>
>(
  primaryLoaderKey: LoaderName,
  foreignKey: KeyName,
  fetchFn: (
    keys: readonly LoaderType<LoaderName>[KeyName][]
  ) => Promise<(LoaderType<LoaderName> & {id: string | number})[]>
) {
  type T = LoaderType<LoaderName>
  type PrimaryKeyT = string | number
  type KeyValue = T[KeyName]
  return (parent: RootDataLoader) => {
    const primaryLoader = parent.get(primaryLoaderKey) as DataLoader<PrimaryKeyT, T, PrimaryKeyT>
    return new DataLoader<KeyValue, T[], KeyValue>(
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
