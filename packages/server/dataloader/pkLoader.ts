import DataLoader from 'dataloader'
import getRethink, {RethinkTypes} from '../database/rethinkDriver'

const normalizeRethinkDbResults = <T extends {id: string}>(keys: string[], results: T[]) => {
  const map = {} as {[key: string]: T}
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    map[result.id] = result
  }
  const mappedResults = [] as T[]
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    mappedResults.push(map[key])
  }
  return mappedResults
}

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
