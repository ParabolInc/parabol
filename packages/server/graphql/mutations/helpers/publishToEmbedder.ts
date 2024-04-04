import {getEmbedderPriority} from '../../../../embedder/getEmbedderPriority'
import getKysely from '../../../postgres/getKysely'

export interface MessageToEmbedderRelatedDiscussions {
  jobType: 'relatedDiscussions:start'
  data: {meetingId: string}
}

export type MessageToEmbedder = {priority: number} & MessageToEmbedderRelatedDiscussions

export const publishToEmbedder = ({jobType, data, priority}: MessageToEmbedder) => {
  return getKysely()
    .insertInto('EmbeddingsJobQueue')
    .values({
      jobType,
      priority: getEmbedderPriority(priority),
      jobData: JSON.stringify(data)
    })
}
