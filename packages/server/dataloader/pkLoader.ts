import DataLoader from 'dataloader'
import getRethink, {RethinkTypes} from '../database/rethinkDriver'
import normalizeRethinkDbResults from './normalizeRethinkDbResults'

const pkLoader = <T extends keyof RethinkTypes>(
  options: DataLoader.Options<string, RethinkTypes[T]['type']>,
  table: T
) => {
  // don't pass in a a filter here because they requested a specific ID, they know what they want
  const batchFn = async (keys) => {
    const r = await getRethink()
    const docs = (await r
      .table(table)
      .getAll(r.args(keys), {index: 'id'})
      .run()) as any
    return normalizeRethinkDbResults<RethinkTypes[T]['type']>(keys, docs)
  }
  return new DataLoader<string, RethinkTypes[T]['type']>(batchFn, options)
}

export default pkLoader
