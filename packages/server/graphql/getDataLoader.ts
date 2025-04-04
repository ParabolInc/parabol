import {getInMemoryDataLoader} from '../dataloader/getInMemoryDataLoader'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import {getRedisDataLoader} from '../dataloader/getRedisDataLoader'

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
