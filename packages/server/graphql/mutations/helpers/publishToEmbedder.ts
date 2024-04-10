import {getEmbedderPriority} from '../../../../embedder/getEmbedderPriority'
import getKysely from '../../../postgres/getKysely'

export interface MessageToEmbedderRelatedDiscussions {
  jobType: 'relatedDiscussions:start'
  data: {meetingId: string}
}

export type MessageToEmbedder = {priority: number} & MessageToEmbedderRelatedDiscussions

const IS_EMBEDDER_ENALBED = !!parseInt(process.env.AI_EMBEDDER_WORKERS!)
export const publishToEmbedder = ({jobType, data, priority}: MessageToEmbedder) => {
  if (!IS_EMBEDDER_ENALBED) return
  return getKysely()
    .insertInto('EmbeddingsJobQueue')
    .values({
      jobType,
      priority: getEmbedderPriority(priority),
      jobData: JSON.stringify(data)
    })
    .execute()
}
