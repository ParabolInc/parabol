import {addEmbeddingsMetadataForRetrospectiveDiscussionTopic} from './addEmbeddingsMetadataForRetrospectiveDiscussionTopic'
import {MessageToEmbedder} from './embedder'

export const addEmbeddingsMetadata = async ({objectTypes, ...options}: MessageToEmbedder) => {
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
