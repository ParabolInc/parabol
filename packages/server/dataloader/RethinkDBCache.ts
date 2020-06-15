import getRethink, {DBType} from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'

export interface Doc {
  id: string
  [key: string]: any
}
export type Updater<T> = Partial<T> | ((doc: RDatum<T>) => any)
export type RWrite<T> = {id: string; table: T; updater: Updater<T>}
export default class RethinkDBCache {
  read = async (keys: string[]) => {
    const r = await getRethink()
    const idsByTable = {} as {[table: string]: string[]}
    keys.forEach((key) => {
      const [table, id] = key.split(':')
      idsByTable[table] = idsByTable[table] || []
      idsByTable[table].push(id)
    })
    const reqlObj = {} as {[table: string]: Doc[]}
    Object.keys(idsByTable).forEach((table) => {
      const ids = idsByTable[table]
      reqlObj[table] = (r
        .table(table as any)
        .getAll(r.args(ids))
        .coerceTo('array') as unknown) as Doc[]
    })

    const dbDocsByTable = await r(reqlObj).run()
    const docsByKey = {} as {[key: string]: Doc}
    Object.keys(dbDocsByTable).forEach((table) => {
      const docs = dbDocsByTable[table]
      docs.forEach((doc) => {
        const key = `${table}:${doc.id}`
        docsByKey[key] = doc
      })
    })
    return docsByKey
  }
  write = async <T extends keyof DBType>(writes: RWrite<T>[]) => {
    const r = await getRethink()
    const reqlParts = writes.map((update) => {
      const {table, id, updater} = update
      return r
        .table(table)
        .get(id)
        .update(updater, {returnChanges: true})('changes')(0)('new_val')
        .default(null)
    })
    return r(reqlParts).run() as Promise<DBType[T][]>
  }
  writeTable = async <T extends keyof DBType>(table: T, updater: Partial<DBType[T]>) => {
    const r = await getRethink()
    return r
      .table(table)
      .update(updater)
      .run()
  }
}
