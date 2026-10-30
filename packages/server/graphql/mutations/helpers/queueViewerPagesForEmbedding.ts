import {sql} from 'kysely'
import {activeEmbeddingModelId, embeddingModelIds} from '../../../../embedder/activeEmbeddingModel'
import {getEmbeddingsRun} from '../../../../embedder/embeddingsRun'
import {getEmbedderJobPriority} from '../../../../embedder/getEmbedderJobPriority'
import {getEmbeddingsPagesTableName} from '../../../../embedder/getEmbeddingsTableName'
import getKysely from '../../../postgres/getKysely'
import {VECTOR_MIN_PAGE_BYTES} from '../../../postgres/queries/getPagesByRRF'
import getRedis from '../../../utils/getRedis'

const VIEWER_PAGE_LIMIT = 500
const QUEUE_INTERVAL_SECONDS = 3600

export const queueViewerPagesForEmbedding = async (viewerId: string) => {
  if (!parseInt(process.env.AI_EMBEDDER_WORKERS!) || !activeEmbeddingModelId) return
  const redis = getRedis()
  const isFirstThisHour = await redis.set(
    `embedOnSearch:${viewerId}`,
    '1',
    'EX',
    QUEUE_INTERVAL_SECONDS,
    'NX'
  )
  if (!isFirstThisHour) return
  const run = await getEmbeddingsRun()
  const isFillingAnother =
    run?.state === 'running' &&
    run.modelId !== activeEmbeddingModelId &&
    embeddingModelIds.includes(run.modelId)
  const modelIds = isFillingAnother
    ? [activeEmbeddingModelId, run.modelId]
    : [activeEmbeddingModelId]
  const pg = getKysely()
  const priority = await getEmbedderJobPriority('historicalUpdate', null, 0)
  for (const modelId of modelIds) {
    const pagesTable = sql.id(getEmbeddingsPagesTableName(modelId)!)
    await sql`
      INSERT INTO "EmbeddingsJobQueueV2" ("jobType", "priority", "pageId", "modelId")
      SELECT 'embedPage:start', ${priority}, p.id, ${modelId}
      FROM "PageAccess" pa
      JOIN "Page" p ON p.id = pa."pageId"
      WHERE pa."userId" = ${viewerId}
        AND p."deletedAt" IS NULL
        AND octet_length(p."plaintextContent") >= ${VECTOR_MIN_PAGE_BYTES}
        AND NOT EXISTS (SELECT 1 FROM ${pagesTable} c WHERE c."pageId" = p.id)
      ORDER BY p."updatedAt" DESC
      LIMIT ${VIEWER_PAGE_LIMIT}
      ON CONFLICT DO NOTHING`.execute(pg)
  }
  await redis.publish('embeddingsJobAdded', '')
}
