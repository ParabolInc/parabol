import type {MeetingSubscription$data} from 'parabol-client/__generated__/MeetingSubscription.graphql'
import type {NotificationSubscription$data} from 'parabol-client/__generated__/NotificationSubscription.graphql'
import type {OrganizationSubscription$data} from 'parabol-client/__generated__/OrganizationSubscription.graphql'
import type {TaskSubscription$data} from 'parabol-client/__generated__/TaskSubscription.graphql'
import type {TeamSubscription$data} from 'parabol-client/__generated__/TeamSubscription.graphql'
import type {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getInMemoryDataLoader} from '../dataloader/getInMemoryDataLoader'
import type RootDataLoader from '../dataloader/RootDataLoader'
import {serializeDataLoader} from '../dataloader/serializeDataLoader'
import getPubSub from './getPubSub'
import getRedis from './getRedis'
import {Logger} from './Logger'

export interface SubOptions {
  mutatorId?: string // passing the socket id of the mutator will omit sending a message to that user
  operationId?: string | null
}

const REDIS_DATALOADER_TTL = 25_000

// a cached key holds exactly one promise, so a key that holds a different promise (or none) than
// it did at the first publish was cleared & reloaded, i.e. its data changed
type CacheSnapshot = Map<string, Promise<unknown>>

// taken synchronously at the publish call so it can't blur into the work that follows it
const snapshotDataLoader = (dataLoaderWorker: RootDataLoader) => {
  const snapshot: CacheSnapshot = new Map()
  Object.entries(dataLoaderWorker.loaders).forEach(([entity, loader]) => {
    const {_cacheMap} = loader as unknown as {_cacheMap?: CacheSnapshot}
    _cacheMap?.forEach((value, key) => {
      snapshot.set(`${entity}:${key}`, value)
    })
  })
  return snapshot
}

// Keys the loader gained since the first publish are ignored: the payload resolvers of the
// mutation that published run after it returns, and caching a fresh read changes no data.
const getChangedKeys = (before: CacheSnapshot, after: CacheSnapshot) =>
  [...before].filter(([key, value]) => after.get(key) !== value).map(([key]) => key)

class PublishedDataLoaders {
  private promiseLookup = {} as Record<string, Promise<void>>
  // only available in development
  private debugSnapshot = {} as Record<
    string,
    {snapshot: CacheSnapshot; topic: string; type: string}
  >

  private async pushToRedis(id: string) {
    const dataLoaderWorker = getInMemoryDataLoader(id)?.dataLoaderWorker
    if (!dataLoaderWorker) {
      // publish did not happen within SHARED_DATALOADER_TTL
      delete this.promiseLookup[id]
      return
    }
    const buffer = await serializeDataLoader(dataLoaderWorker)
    // keep the serialized dataloader in redis for long enough for each server to fetch it and make an in-memory copy
    await getRedis().set(`dataLoader:${id}`, buffer, 'PX', REDIS_DATALOADER_TTL)
    setTimeout(() => {
      delete this.promiseLookup[id]
      delete this.debugSnapshot[id]
      // all calls to publish within a single mutation SHOULD happen within this timeframe
    }, REDIS_DATALOADER_TTL).unref?.()
  }
  async add(id: string, topic: string, type: string) {
    const dataLoaderWorker = !__PRODUCTION__
      ? getInMemoryDataLoader(id)?.dataLoaderWorker
      : undefined
    const previous = this.debugSnapshot[id]
    if (!this.promiseLookup[id]) {
      if (dataLoaderWorker) {
        this.debugSnapshot[id] = {snapshot: snapshotDataLoader(dataLoaderWorker), topic, type}
      }
      this.promiseLookup[id] = this.pushToRedis(id)
    } else if (dataLoaderWorker && previous) {
      const changedKeys = getChangedKeys(previous.snapshot, snapshotDataLoader(dataLoaderWorker))
      if (changedKeys.length > 0) {
        console.warn(
          `publish was called with ${previous.topic} ${previous.type}, then ${changedKeys.join(', ')} changed, then publish was called again for type: ${topic} ${type}. This cannot be. Ensure all "publish" calls happen after changes to data`
        )
      }
    }
    return this.promiseLookup[id]
  }
}
const publishedDataLoaders = new PublishedDataLoaders()

// a client gets only the payloads its subscription selects, and logs an error for any other
interface ClientSubscriptionPayloads {
  [SubscriptionChannel.MEETING]: MeetingSubscription$data['meetingSubscription']
  [SubscriptionChannel.NOTIFICATION]: NotificationSubscription$data['notificationSubscription']
  [SubscriptionChannel.ORGANIZATION]: OrganizationSubscription$data['organizationSubscription']
  [SubscriptionChannel.TASK]: TaskSubscription$data['taskSubscription']
  [SubscriptionChannel.TEAM]: TeamSubscription$data['teamSubscription']
}

export type SubscriptionPayloadName<T extends SubscriptionChannel> = Exclude<
  Extract<keyof ClientSubscriptionPayloads[T], string>,
  'fieldName'
>

const publish = async <T extends SubscriptionChannel>(
  topic: T,
  channel: string,
  type: SubscriptionPayloadName<T>,
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
