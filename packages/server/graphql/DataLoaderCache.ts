export class CacheWorker<T extends {clearAll: (pkLoaderName: any) => void; get: (id: any) => any}> {
  cache: DataLoaderCache
  dataLoaderWorker: T
  did: string
  disposeId: NodeJS.Timeout | undefined
  shared = false
  get: T['get']
  clearAll: T['clearAll']
  constructor(dataLoaderWorker: T, did: string, cache: DataLoaderCache) {
    this.dataLoaderWorker = dataLoaderWorker
    this.did = did
    this.cache = cache
    this.get = this.dataLoaderWorker.get
    this.clearAll = this.dataLoaderWorker.clearAll
  }

  dispose(force?: boolean) {
    const ttl = force || !this.shared ? 0 : this.cache.ttl
    clearTimeout(this.disposeId!)
    this.disposeId = global.setTimeout(() => {
      delete this.cache.workers[this.did]
    }, ttl)
  }

  share() {
    this.shared = true
    return this.did
  }
}

/**
 * A cache of dataloaders, see {@link getDataLoader} for usage
 */
export default class DataLoaderCache<
  T extends new (...args: any) => any = new (...args: any) => any
> {
  ttl: number
  workers: {[did: string]: CacheWorker<InstanceType<T>>} = {}
  nextId = 0
  DataLoaderWorkerConstructor: T
  constructor(DataLoaderWorkerConstructor: T, {ttl} = {ttl: 500}) {
    this.DataLoaderWorkerConstructor = DataLoaderWorkerConstructor
    this.ttl = ttl
  }

  add(did: string) {
    const dataLoaderWorker = new this.DataLoaderWorkerConstructor()
    this.workers[did] = new CacheWorker(dataLoaderWorker, did, this)
    return this.workers[did]!
  }

  use(did: string) {
    return this.workers[did]
  }
}
