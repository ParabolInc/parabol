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
  dataLoader?: DataLoaderWorker
}

interface MessageToEmbedderUserQuery extends BaseMessageToEmbedder {
  jobType: 'userQuery:start'
  data: {
    query: string
    requestId: number
    channelName: string
  }
}

interface MessageToEmbedderEmbedPage extends BaseMessageToEmbedder {
  jobType: 'embedPage:start'
  pageId: number
  data?: {}
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
  'embed:start': 'corpusUpdate',
  'embedPage:start': 'corpusUpdate'
} satisfies Record<JobType, JobKind>

let nextRequestId = 0
export const getUserQueryJobData = (query: string) => {
  return {
    query,
    requestId: ++nextRequestId,
    channelName: `userQueryEmbedding:${SERVER_ID}`
  }
}

export async function publishToEmbedder(
  payload: MessageToEmbedderRelatedDiscussions
): Promise<undefined>
export async function publishToEmbedder(payload: MessageToEmbedderUserQuery): Promise<Float32Array>
export async function publishToEmbedder(payload: MessageToEmbedderEmbedPage): Promise<undefined>
export async function publishToEmbedder(
  payload:
    | MessageToEmbedderUserQuery
    | MessageToEmbedderRelatedDiscussions
    | MessageToEmbedderEmbedPage
) {
  if (!IS_EMBEDDER_ENALBED) return
  const {jobType, userId, dataLoader, data} = payload
  const jobKind = jobTypeToKind[jobType]
  const priority = await getEmbedderJobPriority(jobKind, userId, 0, dataLoader)
  const pageId = (payload as MessageToEmbedderEmbedPage).pageId
  await getKysely()
    .insertInto('EmbeddingsJobQueueV2')
    .values({
      jobType,
      priority,
      modelId: activeEmbeddingModelId,
      pageId,
      jobData: JSON.stringify(data || {})
    })
    .$if(!!pageId, (qb) =>
      qb.onConflict((oc) =>
        oc.columns(['pageId', 'modelId']).doUpdateSet((eb) => ({
          // wait until they stop updating the document to process the embeddings
          priority: eb.ref('excluded.priority')
        }))
      )
    )
    .execute()
  await getRedis().publish('embeddingsJobAdded', '')
  if (data && 'requestId' in data) {
    const {requestId} = data
    const response = await embeddingResponder.waitForResponse(requestId)
    return response
  }
  return
}
