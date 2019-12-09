export class CacheWorker<T> {
  cache: DataLoaderCache<T>
  dataLoader: T
  did: string
  disposeId: NodeJS.Timeout | undefined
  shared = false

  constructor(dataLoader: T, did: string, cache: DataLoaderCache<T>) {
    this.dataLoader = dataLoader
    this.did = did
    this.cache = cache
  }

  get<K extends keyof T>(dataLoaderName: K) {
    return this.dataLoader[dataLoaderName]
  }

  dispose(force?: boolean) {
    const ttl = force || !this.shared ? 0 : this.cache.ttl
    clearTimeout(this.disposeId!)
    this.disposeId = setTimeout(() => {
      delete this.cache[this.did]
    }, ttl)
  }

  share() {
    this.shared = true
    return this.did
  }
}

export default class DataLoaderCache<T> {
  ttl: number
  workers: {[did: string]: CacheWorker<T>} = {}
  nextId = 0
  constructor({ttl} = {ttl: 5000}) {
    this.ttl = ttl
  }

  add<T>(did: string, dataLoader: T) {
    this.workers[did] = new CacheWorker<any>(dataLoader, did, this)
    return this.workers[did]
  }

  use(did: string) {
    return this.workers[did]
  }
}
