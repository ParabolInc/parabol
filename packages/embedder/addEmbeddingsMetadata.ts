import {addEmbeddingsMetadataForRetrospectiveDiscussionTopic} from './addEmbeddingsMetadataForRetrospectiveDiscussionTopic'
import {ALL_OBJECT_TYPES, MessageToEmbedder} from './embedder'

export const addEmbeddingsMetadata = async ({objectType, ...options}: MessageToEmbedder) => {
  const objectTypes = objectType ? [objectType] : ALL_OBJECT_TYPES

  return Promise.all(
    objectTypes.map((type) => {
      switch (type) {
        case 'retrospectiveDiscussionTopic':
          return addEmbeddingsMetadataForRetrospectiveDiscussionTopic(options)
        default:
          throw new Error(`Invalid object type: ${type}`)
      }
    })
  )
}
