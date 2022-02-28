import getLoaderNameByTable from '../dataloader/getLoaderNameByTable'
import {Loaders, TypedDataLoader} from '../dataloader/RootDataLoader'

export interface DataLoaderBase {
  get: (loaderName: any) => unknown
  loaders: {
    [key: string]: {
      clear(id: string): void
    }
  }
}

export class CacheWorker<T extends DataLoaderBase> {
  cache: DataLoaderCache<T>
  dataLoaderBase: T
  did: string
  disposeId: NodeJS.Timeout | undefined
  shared = false

  constructor(dataLoaderBase: T, did: string, cache: DataLoaderCache<T>) {
    this.dataLoaderBase = dataLoaderBase
    this.did = did
    this.cache = cache
  }

  get = <LoaderName extends Loaders>(dataLoaderName: LoaderName) => {
    // Using Loaders here breaks the abstraction.
    // However, when using T['get'], typescript control flow analysis breaks
    // e.g. loader.load() // null | any[], but doesn't catch the null!
    // I'm OK with breaking the abstraction because we only have 1 RootDataLoader
    // Given more time, could probably use a refactor here
    return this.dataLoaderBase.get(dataLoaderName) as TypedDataLoader<LoaderName>
  }

  clear = (table: string, id: string) => {
    const loaderName = getLoaderNameByTable(table)
    this.dataLoaderBase.loaders[loaderName]?.clear(id)
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
export default class DataLoaderCache<T extends DataLoaderBase> {
  ttl: number
  workers: {[did: string]: CacheWorker<T>} = {}
  nextId = 0
  constructor({ttl} = {ttl: 500}) {
    this.ttl = ttl
  }

  add<T>(did: string, dataLoaderBase: T) {
    this.workers[did] = new CacheWorker<any>(dataLoaderBase, did, this)
    return this.workers[did]!
  }

  use(did: string) {
    return this.workers[did]
  }
}
