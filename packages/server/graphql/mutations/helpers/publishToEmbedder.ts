import {sql} from 'kysely'
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
    expiresAt: number
  }
}

interface MessageToEmbedderEmbedPage extends BaseMessageToEmbedder {
  jobType: 'embedPage:start'
  pageId: number
  data?: {}
}

interface MessageToEmbedderEmbed extends BaseMessageToEmbedder {
  jobType: 'embed:start'
  embeddingsMetadataId: number
  data?: {}
}

interface MessageToEmbedderEmbedWithResponse extends BaseMessageToEmbedder {
  jobType: 'embed:start'
  embeddingsMetadataId: number
  data: {requestId: number; channelName: string}
}

interface MessageToEmbedderRelatedDiscussions extends BaseMessageToEmbedder {
  jobType: 'relatedDiscussions:start'
  data: RelatedDiscussionsJobData
}

const PAGE_EMBED_IDLE_DELAY_SECONDS = 60

const IS_EMBEDDER_ENALBED = !!parseInt(process.env.AI_EMBEDDER_WORKERS!)

const jobTypeToKind = {
  'relatedDiscussions:start': 'relatedDiscussion',
  'userQuery:start': 'userQuery',
  'embed:start': 'corpusUpdate',
  'embedPage:start': 'corpusUpdate'
} satisfies Record<JobType, JobKind>

export const getUserQueryJobData = (query: string, timeoutMs = 10_000) => {
  return {
    query,
    requestId: embeddingResponder.nextRequestId(),
    channelName: embeddingResponder.channelName,
    expiresAt: Date.now() + timeoutMs
  }
}

export async function publishToEmbedder(
  payload: MessageToEmbedderRelatedDiscussions
): Promise<undefined>
export async function publishToEmbedder(
  payload: MessageToEmbedderUserQuery
): Promise<Float32Array | Error | undefined>
export async function publishToEmbedder(payload: MessageToEmbedderEmbedPage): Promise<undefined>
export async function publishToEmbedder(payload: MessageToEmbedderEmbed): Promise<undefined>
export async function publishToEmbedder(
  payload: MessageToEmbedderEmbedWithResponse
): Promise<Float32Array | Error | undefined>
export async function publishToEmbedder(
  payload:
    | MessageToEmbedderUserQuery
    | MessageToEmbedderRelatedDiscussions
    | MessageToEmbedderEmbedPage
    | MessageToEmbedderEmbed
    | MessageToEmbedderEmbedWithResponse
) {
  if (!IS_EMBEDDER_ENALBED) return
  const {jobType, userId, dataLoader, data} = payload
  const jobKind = jobTypeToKind[jobType]
  const priority = await getEmbedderJobPriority(jobKind, userId, 0, dataLoader)
  const pageId = (payload as MessageToEmbedderEmbedPage).pageId
  const embeddingsMetadataId = (payload as MessageToEmbedderEmbed).embeddingsMetadataId
  await getKysely()
    .insertInto('EmbeddingsJobQueueV2')
    .values({
      jobType,
      priority,
      modelId: activeEmbeddingModelId,
      pageId,
      embeddingsMetadataId,
      jobData: JSON.stringify(data || {}),
      runAfter: pageId
        ? sql`now() + ${sql.lit(PAGE_EMBED_IDLE_DELAY_SECONDS)} * interval '1 second'`
        : undefined
    })
    .$if(!!pageId, (qb) =>
      qb.onConflict((oc) =>
        oc
          .columns(['pageId', 'modelId'])
          // necessary to use the unique constraint idx we created
          .where('pageId', 'is not', null)
          .doUpdateSet((eb) => ({
            // wait until they stop updating the document to process the embeddings
            priority: eb.ref('excluded.priority'),
            runAfter: eb.ref('excluded.runAfter')
          }))
      )
    )
    .execute()
  await getRedis().publish('embeddingsJobAdded', '')
  if (data && 'requestId' in data) {
    const {requestId} = data
    const timeoutMs = 'expiresAt' in data ? Math.max(0, data.expiresAt - Date.now()) : undefined
    try {
      const vector = await embeddingResponder.waitForResponse(requestId, timeoutMs)
      if (vector.length === 0) {
        return new Error(`Embedder returned an empty vector for request: ${requestId}`)
      }
      return vector
    } catch (e) {
      return e
    }
  }
  return
}
