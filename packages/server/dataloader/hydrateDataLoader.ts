import type DataLoader from 'dataloader'
import {unpack} from 'msgpackr'
import {type Loaders} from '../dataloader/RootDataLoader'
import {dataLoaderCache} from './RootDataLoader'

export const hydrateDataLoader = (id: string, packedDataloader: Buffer) => {
  const loaders = unpack(packedDataloader)
  const cacheWorker = dataLoaderCache.add(id)
  // treat this as shared so if the first subscriber tries to dispose of it, it will wait 500ms (see wsHandler.onComplete)
  // which should be enough time for other subscribers to grab it
  cacheWorker.share()
  Object.entries(loaders).forEach(([loaderName, serializedCacheMap]) => {
    const hydratedLoader = cacheWorker.get(loaderName as Loaders) as DataLoader<any, any>
    Object.entries(serializedCacheMap as Record<string, any>).forEach(([cacheKey, record]) => {
      const unsafeCacheMap = (hydratedLoader as any)._cacheMap as Map<string, any>
      unsafeCacheMap.set(cacheKey, Promise.resolve(record))
    })
  })
  cacheWorker.dispose()
  return cacheWorker
}
