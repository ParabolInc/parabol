import {ALL_OBJECT_TYPES} from './embedder'
import {importHistoricalRetrospectiveDiscussionTopic} from './importHistoricalRetrospectiveDiscussionTopic'

export const importHistoricalMetadata = async () => {
  return Promise.all(
    ALL_OBJECT_TYPES.map(async (objectType) => {
      switch (objectType) {
        case 'retrospectiveDiscussionTopic':
          return importHistoricalRetrospectiveDiscussionTopic()
        default:
          throw new Error(`Invalid object type: ${objectType}`)
      }
    })
  )
}
