import {getInMemoryDataLoader} from '../dataloader/getInMemoryDataLoader'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import {getRedisDataLoader} from '../dataloader/getRedisDataLoader'

// WARNING you must call dispose on the returned dataloader when you're done with it
// This should be done after the request is complete
// see `onResultProcess` hook in `useDisposeDataloader`
// or wsHandler onComplete
const getDataLoader = async (id: string) => {
  const inMemoryLoader = getInMemoryDataLoader(id)
  if (inMemoryLoader) return inMemoryLoader
  const redisDataLoader = await getRedisDataLoader(id)
  if (redisDataLoader) return redisDataLoader
  // setTimeout is here for debugging purposes. Can't figure out what we sometimes get errors saying the dataloader isn't found
  setTimeout(async () => {
    const eventualDataloader = await getRedisDataLoader(id)
    if (eventualDataloader) {
      console.error(`Tried accessing Redis dataloader before it existed: ${id}`)
    } else {
      console.error(`Redis dataloader disposed too early: ${id}`)
    }
  }, 3000)
  // Anything past this line is a bug, but we handle bugs gracefully
  const fallback = getNewDataLoader()
  fallback.share()
  fallback.dispose()
  return fallback
}

export default getDataLoader
