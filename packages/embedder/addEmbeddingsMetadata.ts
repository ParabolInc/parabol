import {addEmbeddingsMetadataForRetrospectiveDiscussionTopic} from './addEmbeddingsMetadataForRetrospectiveDiscussionTopic'
import {EmbeddingObjectType} from './custom'

export type AddEmbeddingsMetadataParams = {
  startAt?: Date
  endAt?: Date
}

type AddEmbeddingsMetadataOptions = AddEmbeddingsMetadataParams & {
  objectTypes: EmbeddingObjectType[]
}

export const addEmbeddingsMetadata = async ({
  objectTypes,
  ...options
}: AddEmbeddingsMetadataOptions) => {
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
