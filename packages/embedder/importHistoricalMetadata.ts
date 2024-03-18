import RedisInstance from 'parabol-server/utils/RedisInstance'
import {ALL_OBJECT_TYPES} from './embedder'
import {importHistoricalRetrospectiveDiscussionTopic} from './importHistoricalRetrospectiveDiscussionTopic'

export const importHistoricalMetadata = async (redis: RedisInstance) => {
  return Promise.all(
    ALL_OBJECT_TYPES.map(async (objectType) => {
      switch (objectType) {
        case 'retrospectiveDiscussionTopic':
          return importHistoricalRetrospectiveDiscussionTopic(redis)
        default:
          throw new Error(`Invalid object type: ${objectType}`)
      }
    })
  )
}
