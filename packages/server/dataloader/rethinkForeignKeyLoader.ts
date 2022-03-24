import DataLoader from 'dataloader'
import {DBType} from '../database/rethinkDriver'

const rethinkForeignKeyLoader = <T extends keyof DBType>(
  standardLoader: DataLoader<string, DBType[T]>,
  options: DataLoader.Options<string, DBType[T]>,
  field: string,
  fetchFn: (ids: readonly string[]) => any[] | Promise<any[]>
) => {
  const batchFn = async (ids: readonly string[]) => {
    const items = await fetchFn(ids)
    items.forEach((item) => {
      standardLoader.clear(item.id).prime(item.id, item)
    })
    return ids.map((id) => items.filter((item) => item[field] === id))
  }
  return new DataLoader<string, DBType[T]>(batchFn, options)
}

export default rethinkForeignKeyLoader
