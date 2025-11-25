import {writeFileSync} from 'node:fs'
import {unpack} from 'msgpackr'
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
  // only available in development
  private debugBufferHash = {} as Record<string, {hash: string; topic: string; type: string}>

  private async pushToRedis(id: string, topic: string, type: string) {
    const dataLoaderWorker = getInMemoryDataLoader(id)?.dataLoaderWorker
    if (!dataLoaderWorker) {
      // publish did not happen within SHARED_DATALOADER_TTL
      return
    }
    const buffer = await serializeDataLoader(dataLoaderWorker)
    if (!__PRODUCTION__) {
      this.debugBufferHash[id] = {
        hash: JSON.stringify(unpack(buffer)),
        topic,
        type
      }
      setTimeout(() => {
        delete this.debugBufferHash[id]
      }, REDIS_DATALOADER_TTL)
    }
    // keep the serialized dataloader in redis for long enough for each server to fetch it and make an in-memory copy
    await getRedis().set(`dataLoader:${id}`, buffer, 'PX', REDIS_DATALOADER_TTL)
    setTimeout(() => {
      delete this.promiseLookup[id]
      // all calls to publish within a single mutation SHOULD happen within this timeframe
    }, REDIS_DATALOADER_TTL)
  }
  async add(id: string, topic: string, type: string) {
    if (!this.promiseLookup[id]) {
      this.promiseLookup[id] = this.pushToRedis(id, topic, type)
    } else if (!__PRODUCTION__) {
      const dataLoaderWorker = getInMemoryDataLoader(id)?.dataLoaderWorker
      if (!dataLoaderWorker) return
      const buffer = await serializeDataLoader(dataLoaderWorker)
      const hash = JSON.stringify(unpack(buffer))
      const existingBufferHash = this.debugBufferHash[id]
      if (!existingBufferHash) {
        console.log('In dev, the debugBufferHash does not exist yet. Try a delay')
        return
      }
      const {hash: oldHash, topic: oldTopic, type: oldType} = existingBufferHash
      if (oldHash !== hash) {
        writeFileSync('publishedDataloader1.json', oldHash!)
        writeFileSync('publishedDataloader2.json', hash!)
        console.warn(
          `publish was called with ${oldTopic} ${oldType}, then the dataloader was mutated, then publish was called again for type: ${topic} ${type}. This cannot be. Ensure all "publish" calls happen after changes to data`
        )
      }
    }
    return this.promiseLookup[id]
  }
}
const publishedDataLoaders = new PublishedDataLoaders()

const publish = async <T extends string>(
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
    await publishedDataLoaders.add(operationId, topic, type)
  }
  getPubSub()
    .publish(`${topic}.${channel}`, {rootValue, ...subOptions})
    .catch(Logger.error)
}

export default publish
