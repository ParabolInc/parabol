import RedisInstance from 'parabol-server/utils/RedisInstance'
import {addEmbeddingsMetadataForRetrospectiveDiscussionTopic} from './addEmbeddingsMetadataForRet'
import {EmbeddingObjectType, PubSubEmbedderMessage} from './embedder'

export const addEmbeddingsMetadata = async (
  redis: RedisInstance,
  {objectType, startAt, endAt}: PubSubEmbedderMessage
) => {
  const ALL_OBJECT_TYPES: EmbeddingObjectType[] = ['retrospectiveDiscussionTopic']
  const objectTypes = objectType ? [objectType] : ALL_OBJECT_TYPES

  objectTypes.forEach((type) => {
    switch (type) {
      case 'retrospectiveDiscussionTopic':
        addEmbeddingsMetadataForRetrospectiveDiscussionTopic(redis, startAt, endAt)
        break
      default:
        throw new Error(`Invalid object type: ${type}`)
    }
  })
}
