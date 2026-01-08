import type {JobType} from '../../../../embedder/custom'
import {getEmbedderJobPriority, type JobKind} from '../../../../embedder/getEmbedderJobPriority'
import getKysely from '../../../postgres/getKysely'
import getRedis from '../../../utils/getRedis'
import type {DataLoaderWorker} from '../../graphql'

export interface RelatedDiscussionsJobData {
  meetingId: string
}

export type MessageToEmbedder = {
  jobType: JobType
  jobKind: JobKind
  data: RelatedDiscussionsJobData | any
  userId?: string | undefined | null
  dataLoader: DataLoaderWorker
}

const IS_EMBEDDER_ENALBED = !!parseInt(process.env.AI_EMBEDDER_WORKERS!)
export const publishToEmbedder = async ({
  jobType,
  jobKind,
  data,
  userId,
  dataLoader
}: MessageToEmbedder) => {
  if (!IS_EMBEDDER_ENALBED) return
  const priority = await getEmbedderJobPriority(jobKind, userId, 0, dataLoader)
  await getKysely()
    .insertInto('EmbeddingsJobQueueV2')
    .values({
      jobType,
      priority,
      jobData: JSON.stringify(data)
    })
    .execute()
  await getRedis().publish('embeddingsJobAdded', '')
}
