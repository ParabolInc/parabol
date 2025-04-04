import {getInMemoryDataLoader} from '../dataloader/getInMemoryDataLoader'
import {serializeDataLoader} from '../dataloader/serializeDataLoader'
import getPubSub from './getPubSub'
import getRedis from './getRedis'
import {Logger} from './Logger'

export interface SubOptions {
  mutatorId?: string // passing the socket id of the mutator will omit sending a message to that user
  operationId?: string | null
}

const REDIS_DATALOADER_TTL = 25_000
class PublishedDataLoaders {
  private set = new Set<string>()
  async add(id: string) {
    const exists = this.set.has(id)
    if (exists) return
    this.set.add(id)
    const dataLoaderWorker = getInMemoryDataLoader(id)!.dataLoaderWorker
    const str = await serializeDataLoader(dataLoaderWorker)
    // keep the serialized dataloader in redis for long enough for each server to fetch it and make an in-memory copy
    await getRedis().set(`dataLoader:${id}`, str, 'PX', REDIS_DATALOADER_TTL)
    setTimeout(() => {
      this.set.delete(id)
      // all calls to publish within a single mutation SHOULD happen within this timeframe
    }, REDIS_DATALOADER_TTL)
  }
}
const publishedDataLoaders = new PublishedDataLoaders()

const publish = async <T>(
  topic: T,
  channel: string,
  type: string,
  payload: {[key: string]: any},
  subOptions: SubOptions = {}
) => {
  const subName = `${topic}Subscription`
  const rootValue = {[subName]: {fieldName: type, [type]: payload}}
  const {operationId} = subOptions
  if (operationId) {
    await publishedDataLoaders.add(operationId)
  }
  getPubSub()
    .publish(`${topic}.${channel}`, {rootValue, ...subOptions})
    .catch(Logger.error)
}

export default publish
