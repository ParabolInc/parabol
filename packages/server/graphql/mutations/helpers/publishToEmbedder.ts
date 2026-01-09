import {activeEmbeddingModelId} from '../../../../embedder/activeEmbeddingModel'
import type {JobType} from '../../../../embedder/custom'
import {getEmbedderJobPriority, type JobKind} from '../../../../embedder/getEmbedderJobPriority'
import getKysely from '../../../postgres/getKysely'
import {embeddingResponder} from '../../../utils/embeddingResponder'
import getRedis from '../../../utils/getRedis'
import type {DataLoaderWorker} from '../../graphql'

export interface RelatedDiscussionsJobData {
  meetingId: string
}

interface BaseMessageToEmbedder {
  userId?: string | undefined | null
  dataLoader: DataLoaderWorker
}

interface MessageToEmbedderUserQuery extends BaseMessageToEmbedder {
  jobType: 'userQuery:start'
  data: {
    query: string
  }
}

interface MessageToEmbedderRelatedDiscussions extends BaseMessageToEmbedder {
  jobType: 'relatedDiscussions:start'
  data: RelatedDiscussionsJobData
}

const IS_EMBEDDER_ENALBED = !!parseInt(process.env.AI_EMBEDDER_WORKERS!)
const SERVER_ID = process.env.SERVER_ID

const jobTypeToKind = {
  'relatedDiscussions:start': 'relatedDiscussion',
  'userQuery:start': 'userQuery',
  'embed:start': 'corpusUpdate'
} satisfies Record<JobType, JobKind>

let nextRequestId = 0

export async function publishToEmbedder(
  payload: MessageToEmbedderRelatedDiscussions
): Promise<undefined>
export async function publishToEmbedder(payload: MessageToEmbedderUserQuery): Promise<Float32Array>
export async function publishToEmbedder(
  payload: MessageToEmbedderUserQuery | MessageToEmbedderRelatedDiscussions
) {
  if (!IS_EMBEDDER_ENALBED) return
  const {jobType, userId, dataLoader} = payload
  const jobKind = jobTypeToKind[jobType]
  const priority = await getEmbedderJobPriority(jobKind, userId, 0, dataLoader)
  const getJobData = () => {
    if (payload.jobType === 'userQuery:start') {
      return {
        ...payload.data,
        requestId: ++nextRequestId,
        channelName: `userQueryEmbedding:${SERVER_ID}`
      }
    }
    return payload.data
  }
  const jobData = getJobData()
  await getKysely()
    .insertInto('EmbeddingsJobQueueV2')
    .values({
      jobType,
      priority,
      modelId: activeEmbeddingModelId,
      jobData: JSON.stringify(jobData)
    })
    .execute()
  await getRedis().publish('embeddingsJobAdded', '')
  if ('requestId' in jobData) {
    const {requestId} = jobData
    const response = await embeddingResponder.waitForResponse(requestId)
    return response
  }
  return
}
