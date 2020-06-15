import DataLoader from 'dataloader'
import {DBType} from '../database/rethinkDriver'
import db from '../db'

export default class ProxiedCache<T extends keyof DBType> implements DataLoader<string, T> {
  table: T
  constructor(table: T) {
    this.table = table
  }

  load(id: string) {
    return db.read(this.table, id)
  }
  loadMany(ids: string[]) {
    return db.readMany(this.table, ids)
  }

  clear(id: string) {
    // this is actually async, but we don't await so it looks like a DataLoader
    db.clear(this.table, id)
    return this
  }
  clearAll() {
    // noop, need to implement in LocalCache
    return this
  }
  prime(_id: string, doc: any) {
    db.prime(this.table, [doc])
    return this
  }
}
