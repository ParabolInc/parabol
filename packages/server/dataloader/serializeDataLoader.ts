import {pack} from 'msgpackr'
import type RootDataLoader from './RootDataLoader'

export const serializeDataLoader = async (dataLoaderWorker: RootDataLoader) => {
  const result = {} as Record<string, any>
  const loaders = Object.entries(dataLoaderWorker.loaders)
  await Promise.all(
    loaders.map(async ([entity, loader]) => {
      const cacheMap = (loader as any)._cacheMap as Map<string, Promise<any>>
      const values = {} as Record<string, any>
      for (const [key, val] of cacheMap) {
        values[key] = await val
      }
      result[entity] = values
    })
  )
  return pack(result)
}
