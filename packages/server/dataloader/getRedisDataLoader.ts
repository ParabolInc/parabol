import getRedis from '../utils/getRedis'
import {hydrateDataLoader} from './hydrateDataLoader'

export const getRedisDataLoader = async (id: string) => {
  const serializedDataLoader = await getRedis().getBuffer(`dataLoader:${id}`)
  if (serializedDataLoader) {
    return hydrateDataLoader(id, serializedDataLoader)
  }
  return undefined
}
