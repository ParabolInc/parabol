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
  private promiseLookup = {} as Record<string, Promise<void>>
  private async pushToRedis(id: string) {
    const dataLoaderWorker = getInMemoryDataLoader(id)?.dataLoaderWorker
    if (!dataLoaderWorker) {
      // publish did not happen within SHARED_DATALOADER_TTL
      return
    }
    const buffer = await serializeDataLoader(dataLoaderWorker)
    // keep the serialized dataloader in redis for long enough for each server to fetch it and make an in-memory copy
    await getRedis().set(`dataLoader:${id}`, buffer, 'PX', REDIS_DATALOADER_TTL)
    setTimeout(() => {
      delete this.promiseLookup[id]
      // all calls to publish within a single mutation SHOULD happen within this timeframe
    }, REDIS_DATALOADER_TTL)
  }
  async add(id: string) {
    if (!this.promiseLookup[id]) {
      this.promiseLookup[id] = this.pushToRedis(id)
    }
    return this.promiseLookup[id]
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
