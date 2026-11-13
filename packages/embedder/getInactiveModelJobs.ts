import type {Insertable} from 'kysely'
import type {DataLoaderWorker} from '../server/graphql/graphql'
import type {DB} from '../server/postgres/types/pg'
import {inactiveEmbeddingModelIds} from './activeEmbeddingModel'
import {getEmbedderJobPriority} from './getEmbedderJobPriority'

type QueuedJob = Insertable<DB['EmbeddingsJobQueueV2']>

export const getInactiveModelJobs = async (
  job: Pick<QueuedJob, 'jobType' | 'pageId' | 'embeddingsMetadataId'>,
  userId?: string | null,
  dataLoader?: DataLoaderWorker
): Promise<QueuedJob[]> => {
  if (inactiveEmbeddingModelIds.length === 0) return []
  const priority = await getEmbedderJobPriority('modelUpdate', userId, 0, dataLoader)
  // fullText is built in the active model's format, so the other models build their own
  const jobData = JSON.stringify(job.jobType === 'embed:start' ? {forceBuildText: true} : {})
  return inactiveEmbeddingModelIds.map((modelId) => ({...job, modelId, priority, jobData}))
}
