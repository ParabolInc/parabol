import DataLoader from 'dataloader'

const fkLoader = <T = any>(
  standardLoader: DataLoader<string, T>,
  options: DataLoader.Options<string, T[]>,
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
  return new DataLoader<string, T[]>(batchFn, options)
}

export default fkLoader
