import RedisInstance from 'parabol-server/utils/RedisInstance'
import {addEmbeddingsMetadataForRetrospectiveDiscussionTopic} from './addEmbeddingsMetadataForRet'
import {ALL_OBJECT_TYPES, MessageToEmbedder} from './embedder'

export const addEmbeddingsMetadata = async (
  redis: RedisInstance,
  {objectType, ...options}: MessageToEmbedder
) => {
  const objectTypes = objectType ? [objectType] : ALL_OBJECT_TYPES

  return Promise.all(
    objectTypes.map((type) => {
      switch (type) {
        case 'retrospectiveDiscussionTopic':
          return addEmbeddingsMetadataForRetrospectiveDiscussionTopic(redis, options)
        default:
          throw new Error(`Invalid object type: ${type}`)
      }
    })
  )
}
