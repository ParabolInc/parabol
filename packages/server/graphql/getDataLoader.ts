import {getInMemoryDataLoader} from '../dataloader/getInMemoryDataLoader'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import {getRedisDataLoader} from '../dataloader/getRedisDataLoader'
import {Logger} from '../utils/Logger'

// WARNING you must call dispose on the returned dataloader when you're done with it
// This should be done after the request is complete
// see `onResultProcess` hook in `useDisposeDataloader`
// or wsHandler onComplete
const getDataLoader = async (id: string) => {
  const inMemoryLoader = getInMemoryDataLoader(id)
  if (inMemoryLoader) return inMemoryLoader
  const redisDataLoader = await getRedisDataLoader(id)
  if (redisDataLoader) return redisDataLoader
  Logger.error(`DataLoader not found in memory or Redis: ${id}`)
  // Anything past this line is a bug, but we handle bugs gracefully
  const fallback = getNewDataLoader('getDataLoader-fallback')
  fallback.share()
  fallback.dispose()
  return fallback
}

export default getDataLoader
