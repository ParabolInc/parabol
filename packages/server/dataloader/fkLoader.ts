import DataLoader from 'dataloader'
import {RethinkTypes} from '../database/rethinkDriver'

const fkLoader = <T extends keyof RethinkTypes>(
  standardLoader: DataLoader<string, RethinkTypes[T]['type']>,
  options: DataLoader.Options<string, RethinkTypes[T]['type']>,
  field: string,
  fetchFn: (ids: string[]) => any[] | Promise<any[]>
) => {
  const batchFn = async (ids) => {
    const items = await fetchFn(ids)
    items.forEach((item) => {
      standardLoader.clear(item.id).prime(item.id, item)
    })
    return ids.map((id) => items.filter((item) => item[field] === id))
  }
  return new DataLoader<string, RethinkTypes[T]['type']>(batchFn, options)
}

export default fkLoader
