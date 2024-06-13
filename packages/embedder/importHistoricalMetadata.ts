import {EmbeddingObjectType} from './custom'
import {importHistoricalMeetingTemplates} from './importHistoricalMeetingTemplates'
import {importHistoricalRetrospectiveDiscussionTopic} from './importHistoricalRetrospectiveDiscussionTopic'

export const importHistoricalMetadata = async () => {
  const OBJECT_TYPES: EmbeddingObjectType[] = ['retrospectiveDiscussionTopic', 'meetingTemplate']
  return Promise.all(
    OBJECT_TYPES.map(async (objectType) => {
      switch (objectType) {
        case 'retrospectiveDiscussionTopic':
          return importHistoricalRetrospectiveDiscussionTopic()
        case 'meetingTemplate':
          return importHistoricalMeetingTemplates()
        default:
          throw new Error(`Invalid object type: ${objectType}`)
      }
    })
  )
}
