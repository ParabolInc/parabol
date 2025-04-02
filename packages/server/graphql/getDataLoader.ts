import type DataLoader from 'dataloader'
import RootDataLoader, {type Loaders} from '../dataloader/RootDataLoader'
import getRedis from '../utils/getRedis'
import {INSTANCE_ID} from '../utils/instanceId'
import {Logger} from '../utils/Logger'
import numToBase64 from '../utils/numToBase64'
import DataLoaderCache from './DataLoaderCache'
const dataLoaderCache = new DataLoaderCache(RootDataLoader)
let nextId = 0

// Can remove this after we verify there are no memory leaks in prod
// count staying constant or going down = good
setInterval(() => {
  const workerCount = Object.keys(dataLoaderCache.workers).length
  Logger.log({workerCount})
}, 60_000)

const hydrateDataLoader = (id: string, dataLoaderJSON: string) => {
  const loaders = JSON.parse(dataLoaderJSON)
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

export const getNewDataLoader = () => {
  const id = `${INSTANCE_ID}:${numToBase64(nextId++)}`
  return dataLoaderCache.add(id)
}

export const getInMemoryDataLoader = (id: string) => {
  return dataLoaderCache.use(id)
}

const getRedisDataLoader = async (id: string) => {
  const serializedDataLoader = await getRedis().get(`dataLoader:${id}`)
  if (serializedDataLoader) {
    return hydrateDataLoader(id, serializedDataLoader)
  }
  return undefined
}

// WARNING you must call dispose on the returned dataloader when you're done with it
// This should be done after the request is complete
// see `onResultProcess` hook in `useDisposeDataloader`
// or wsHandler onComplete
const getDataLoader = async (id?: string) => {
  if (id) {
    const inMemoryLoader = getInMemoryDataLoader(id)
    if (inMemoryLoader) return inMemoryLoader
    const redisDataLoader = await getRedisDataLoader(id)
    if (redisDataLoader) return redisDataLoader
    console.error(`Could not find dataloader: ${id}. Did redis dispose too early?`)
  }
  return getNewDataLoader()
}

export default getDataLoader
