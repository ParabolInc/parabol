import {getEmbedderPriority} from '../../../../embedder/getEmbedderPriority'
import getKysely from '../../../postgres/getKysely'
import getRedis from '../../../utils/getRedis'

export interface MessageToEmbedderRelatedDiscussions {
  jobType: 'relatedDiscussions:start'
  data: {meetingId: string}
}

export type MessageToEmbedder = {
  priority: number
} & MessageToEmbedderRelatedDiscussions

const IS_EMBEDDER_ENALBED = !!parseInt(process.env.AI_EMBEDDER_WORKERS!)
export const publishToEmbedder = async ({jobType, data, priority}: MessageToEmbedder) => {
  if (!IS_EMBEDDER_ENALBED) return
  await getKysely()
    .insertInto('EmbeddingsJobQueue')
    .values({
      jobType,
      priority: getEmbedderPriority(priority),
      jobData: JSON.stringify(data)
    })
    .execute()
  await getRedis().publish('embeddingsJobAdded', '')
}
