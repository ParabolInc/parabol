import DataLoader from 'dataloader'
import getRethink, {DBType} from '../database/rethinkDriver'
import normalizeRethinkDbResults from './normalizeRethinkDbResults'

const rethinkPrimaryKeyLoader = <T extends keyof DBType>(
  options: DataLoader.Options<string, DBType[T]>,
  table: T
) => {
  // don't pass in a a filter here because they requested a specific ID, they know what they want
  const batchFn = async (keys: readonly string[]) => {
    const r = await getRethink()
    const docs = (await r
      .table(table)
      .getAll(r.args(keys as string[]), {index: 'id'})
      .run()) as any
    return normalizeRethinkDbResults<DBType[T]>(keys, docs)
  }
  return new DataLoader<string, DBType[T]>(batchFn, options)
}

export default rethinkPrimaryKeyLoader
