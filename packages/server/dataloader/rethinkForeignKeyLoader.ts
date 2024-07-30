import {DBType} from '../database/rethinkDriver'
import RootDataLoader, {RegisterDependsOn} from './RootDataLoader'
import UpdatableCacheDataLoader from './UpdatableCacheDataLoader'
import * as rethinkPrimaryKeyLoaderMakers from './rethinkPrimaryKeyLoaderMakers'

const rethinkForeignKeyLoader = <T extends keyof DBType>(
  parent: RootDataLoader,
  dependsOn: RegisterDependsOn,
  primaryKeyLoaderName: keyof typeof rethinkPrimaryKeyLoaderMakers,
  field: string,
  fetchFn: (ids: readonly string[]) => any[] | Promise<any[]>
) => {
  const standardLoader = parent.get(primaryKeyLoaderName)
  dependsOn(primaryKeyLoaderName)
  const batchFn = async (ids: readonly string[]) => {
    const items = await fetchFn(ids)
    items.forEach((item) => {
      standardLoader.clear(item.id).prime(item.id, item)
    })
    return ids.map((id) => items.filter((item) => item[field] === id))
  }
  return new UpdatableCacheDataLoader<string, DBType[T][]>(batchFn, {...parent.dataLoaderOptions})
}

export default rethinkForeignKeyLoader
