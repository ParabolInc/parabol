import ms from 'ms'
import {RethinkTypes} from '../database/rethinkDriver'
import RedisCache from './RedisCache'
import {Doc, RType, RWrite, Updater} from './RethinkDBCache'

const resolvedPromise = Promise.resolve()

// every original read has 1 key, 1 callback and 1 entry in the cacheMap
// every duplicate request has 1 cacheHit that, when called, resolves to the original promise in the cacheMap
export default class LocalCache {
  private cacheMap = {} as {[key: string]: {ts: number; promise: Promise<any>}}
  private hasReadDispatched = true
  private hasWriteDispatched = true
  private keys = [] as string[]
  private callbacks = [] as {resolve: (payload: any) => void; reject: (err: any) => void}[]
  private cacheHits = [] as (() => void)[]
  private writes = [] as (RWrite<any> & {resolve: (payload: any) => void})[]
  private ttl = ms('1h')
  private redisCache = new RedisCache()
  constructor() {
    setInterval(this.gc, this.ttl).unref()
  }

  private gc = () => {
    const keys = Object.keys(this.cacheMap)
    const oldestValidTS = Date.now() - this.ttl
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const {ts} = this.cacheMap[key]
      if (ts < oldestValidTS) {
        delete this.cacheMap[key]
      }
    }
  }
  private resolveCacheHits(cacheHits: (() => void)[]) {
    // cacheHits are possibly from the previous batch, hence the param
    for (let i = 0; i < cacheHits.length; i++) {
      cacheHits[i]()
    }
  }
  private dispatchBatch = async () => {
    this.hasReadDispatched = true
    // grab a reference to them now because after await is called they may be overwritten when a new batch is created
    const {keys, callbacks, cacheHits} = this
    if (keys.length === 0) {
      this.resolveCacheHits(cacheHits)
      return
    }
    try {
      const values = await this.redisCache.read(keys)
      this.resolveCacheHits(cacheHits)
      for (let i = 0; i < callbacks.length; i++) {
        const {resolve, reject} = callbacks[i]
        const value = values[i]
        const handle = value instanceof Error ? reject : resolve
        handle(value)
      }
    } catch (e) {
      this.resolveCacheHits(cacheHits)
      for (let i = 0; i < callbacks.length; i++) {
        this.clearLocal(keys[i])
        const {reject} = callbacks[i]
        reject(e)
      }
    }
  }

  private clearLocal(key: string) {
    delete this.cacheMap[key]
    return this
  }
  private primeLocal(key: string, doc: Doc) {
    this.cacheMap[key] = {
      ts: Date.now(),
      promise: Promise.resolve(doc)
    }
  }

  private dispatchWrite = async () => {
    this.hasWriteDispatched = true
    const {writes} = this
    const results = await this.redisCache.write(writes)
    writes.forEach(({resolve, table, id}, idx) => {
      const key = `${table}:${id}`
      const result = results[idx]
      this.primeLocal(key, result)
      resolve(result)
    })
  }
  async clear<T extends keyof RethinkTypes>(table: T, id: string) {
    const key = `${table}:${id}`
    this.clearLocal(key)
    await this.redisCache.clear(key)
    return this
  }

  async prime<T extends keyof RethinkTypes>(table: T, docs: RType<T>[]) {
    docs.forEach((doc) => {
      const key = `${table}:${doc.id}`
      this.primeLocal(key, doc)
    })
    this.redisCache.prime(table, docs)
    return this
  }
  async read<T extends keyof RethinkTypes>(table: T, id: string) {
    const key = `${table}:${id}`
    if (this.hasReadDispatched) {
      this.hasReadDispatched = false
      this.keys = []
      this.callbacks = []
      this.cacheHits = []
      resolvedPromise.then(() => {
        process.nextTick(this.dispatchBatch)
      })
    }
    const cachedRecord = this.cacheMap[key]
    if (cachedRecord) {
      cachedRecord.ts = Date.now()
      return new Promise<RType<T>>((resolve) => {
        this.cacheHits.push(() => {
          resolve(cachedRecord.promise)
        })
      })
    }
    this.keys.push(key)
    const promise = new Promise<RType<T>>((resolve, reject) => {
      this.callbacks.push({resolve, reject})
    })
    this.cacheMap[key] = {ts: Date.now(), promise}
    return promise
  }

  async readMany<T extends keyof RethinkTypes>(table: T, ids: string[]) {
    const loadPromises = [] as Promise<RType<T>>[]
    for (let i = 0; i < ids.length; i++) {
      loadPromises.push(this.read(table, ids[i]).catch((error) => error))
    }
    return Promise.all(loadPromises)
  }
  async write<T extends keyof RethinkTypes, P extends RType<T>>(
    table: T,
    id: string,
    updater: Updater<P>
  ) {
    if (this.hasWriteDispatched) {
      this.hasWriteDispatched = false
      this.writes = [] as (RWrite<P> & {resolve: (payload: any) => void})[]
      resolvedPromise.then(() => {
        process.nextTick(this.dispatchWrite)
      })
    }
    return new Promise<P>((resolve) => {
      this.writes.push({id, table, updater, resolve})
    })
  }

  async writeMany<T extends keyof RethinkTypes, P extends RType<T>>(
    table: T,
    ids: string[],
    updater: Updater<P>
  ) {
    return Promise.all(ids.map((id) => this.write(table, id, updater)))
  }

  // currently doesn't support updater functions
  async writeTable<T extends keyof RethinkTypes, P extends Partial<RType<T>>>(
    table: T,
    updater: P
  ) {
    Object.keys(this.cacheMap).forEach((key) => {
      if (!key.startsWith(`${table}:`)) return
      const doc = this.cacheMap[key]
      Object.assign(doc, updater)
    })
    await this.redisCache.writeTable(table, updater)
  }
}
