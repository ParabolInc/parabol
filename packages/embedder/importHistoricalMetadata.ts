import {EmbeddingObjectType} from './custom'
import {importHistoricalRetrospectiveDiscussionTopic} from './importHistoricalRetrospectiveDiscussionTopic'

export const importHistoricalMetadata = async () => {
  const OBJECT_TYPES: EmbeddingObjectType[] = ['retrospectiveDiscussionTopic']
  return Promise.all(
    OBJECT_TYPES.map(async (objectType) => {
      switch (objectType) {
        case 'retrospectiveDiscussionTopic':
          return importHistoricalRetrospectiveDiscussionTopic()
        default:
          throw new Error(`Invalid object type: ${objectType}`)
      }
    })
  )
}
