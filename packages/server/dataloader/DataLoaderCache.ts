export const SHARED_DATALOADER_TTL = 30_000
export class CacheWorker<T extends {clearAll: (pkLoaderName: any) => void; get: (id: any) => any}> {
  dataLoaderWorker: T
  did: string
  disposeId: NodeJS.Timeout | undefined
  // who added this to the cache?
  source: string | undefined

  shared = false
  get: T['get']
  clearAll: T['clearAll']
  onDispose: () => void
  constructor(dataLoaderWorker: T, did: string, onDispose: () => void, source: string) {
    this.dataLoaderWorker = dataLoaderWorker
    this.did = did
    this.get = this.dataLoaderWorker.get
    this.clearAll = this.dataLoaderWorker.clearAll
    this.onDispose = onDispose
    this.source = source
  }

  dispose() {
    const ttl = this.shared ? SHARED_DATALOADER_TTL : 0
    clearTimeout(this.disposeId)
    this.disposeId = setTimeout(() => {
      this.onDispose()
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
  T extends new (
    ...args: any
  ) => any = new (
    ...args: any
  ) => any
> {
  workers: {[did: string]: CacheWorker<InstanceType<T>>} = {}
  nextId = 0
  DataLoaderWorkerConstructor: T
  constructor(DataLoaderWorkerConstructor: T) {
    this.DataLoaderWorkerConstructor = DataLoaderWorkerConstructor
  }

  add(did: string, source: string) {
    const dataLoaderWorker = new this.DataLoaderWorkerConstructor()
    const onDispose = () => {
      delete this.workers[did]
    }
    this.workers[did] = new CacheWorker(dataLoaderWorker, did, onDispose, source)
    return this.workers[did]!
  }

  use(did: string) {
    return this.workers[did]
  }
}
