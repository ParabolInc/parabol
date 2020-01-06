import DataLoader from 'dataloader'
import {Tables} from './tables'

const fkLoader = <T extends keyof Tables>(
  standardLoader: DataLoader<string, Tables[T]>,
  options: DataLoader.Options<string, Tables[T]>,
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
  return new DataLoader<string, Tables[T]>(batchFn, options)
}

export default fkLoader
