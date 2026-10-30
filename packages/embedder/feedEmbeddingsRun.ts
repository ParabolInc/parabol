import {type Kysely, sql} from 'kysely'
import getKysely from '../server/postgres/getKysely'
import type {DB} from '../server/postgres/types/pg'
import {activeEmbeddingModelId} from './activeEmbeddingModel'
import type {ModelId} from './ai_models/modelIdDefinitions'
import type {EmbeddingsRun} from './embeddingsRun'
import {getEmbedderJobPriority} from './getEmbedderJobPriority'
import {getEmbeddingsPagesTableName, getEmbeddingsTableName} from './getEmbeddingsTableName'

const METADATA_COPY_BATCH = 1000

interface Progress {
  done: number
  total: number
}

export interface EmbeddingsRunProgress {
  recentPages: Progress
  olderPages: Progress
  metadata: Progress
  queued: number
}

const countQueuedJobs = async (modelId: ModelId, db: Kysely<DB>) => {
  const {count} = await db
    .selectFrom('EmbeddingsJobQueueV2')
    .select(sql<number>`count(*)::int`.as('count'))
    .where('modelId', '=', modelId)
    .where('state', '=', 'queued')
    .executeTakeFirstOrThrow()
  return count
}

export const getEmbeddingsRunProgress = async (
  modelId: ModelId,
  sourceModelId: ModelId,
  db: Kysely<DB> = getKysely()
): Promise<EmbeddingsRunProgress> => {
  const sourcePages = sql.id(getEmbeddingsPagesTableName(sourceModelId)!)
  const targetPages = sql.id(getEmbeddingsPagesTableName(modelId)!)
  const sourceMetadata = sql.id(getEmbeddingsTableName(sourceModelId))
  const targetMetadata = sql.id(getEmbeddingsTableName(modelId))
  const {
    rows: [pages]
  } = await sql<{recentDone: number; recentTotal: number; olderDone: number; olderTotal: number}>`
    SELECT
      count(*) FILTER (WHERE recent)::int AS "recentTotal",
      count(*) FILTER (WHERE recent AND done)::int AS "recentDone",
      count(*) FILTER (WHERE NOT recent)::int AS "olderTotal",
      count(*) FILTER (WHERE NOT recent AND done)::int AS "olderDone"
    FROM (
      SELECT
        p."updatedAt" > now() - interval '90 days' AS recent,
        EXISTS (SELECT 1 FROM ${targetPages} t WHERE t."pageId" = p.id) AS done
      FROM "Page" p
      WHERE p."deletedAt" IS NULL AND EXISTS (SELECT 1 FROM ${sourcePages} s WHERE s."pageId" = p.id)
    ) pages`.execute(db)
  const {
    rows: [metadata]
  } = await sql<{done: number; total: number}>`
    SELECT count(*)::int AS "total", count(*) FILTER (WHERE done)::int AS "done"
    FROM (
      SELECT DISTINCT s."embeddingsMetadataId", EXISTS (
        SELECT 1 FROM ${targetMetadata} t WHERE t."embeddingsMetadataId" = s."embeddingsMetadataId"
      ) AS done
      FROM ${sourceMetadata} s
    ) metadata`.execute(db)
  return {
    recentPages: {done: pages!.recentDone, total: pages!.recentTotal},
    olderPages: {done: pages!.olderDone, total: pages!.olderTotal},
    metadata: {done: metadata!.done, total: metadata!.total},
    queued: await countQueuedJobs(modelId, db)
  }
}

export const feedEmbeddingsRun = async (
  run: EmbeddingsRun | null,
  sourceModelId: ModelId | null = activeEmbeddingModelId,
  db: Kysely<DB> = getKysely()
): Promise<EmbeddingsRunProgress | null> => {
  if (!run || run.state !== 'running' || !sourceModelId || run.modelId === sourceModelId) {
    return null
  }
  const {modelId, copyMetadata, queueSize} = run
  const sourcePages = sql.id(getEmbeddingsPagesTableName(sourceModelId)!)
  const targetPages = sql.id(getEmbeddingsPagesTableName(modelId)!)
  const sourceMetadata = sql.id(getEmbeddingsTableName(sourceModelId))
  const targetMetadata = sql.id(getEmbeddingsTableName(modelId))
  const priority = await getEmbedderJobPriority('modelUpdate', null, 0)
  const missingMetadataIds = sql`
    SELECT DISTINCT s."embeddingsMetadataId" FROM ${sourceMetadata} s
    WHERE NOT EXISTS (
      SELECT 1 FROM ${targetMetadata} t WHERE t."embeddingsMetadataId" = s."embeddingsMetadataId"
    )`
  if (copyMetadata) {
    await sql`
      INSERT INTO ${targetMetadata} ("embedText", "tsv", "embedding", "embeddingsMetadataId", "chunkNumber")
      SELECT "embedText", "tsv", "embedding", "embeddingsMetadataId", "chunkNumber" FROM ${sourceMetadata}
      WHERE "embeddingsMetadataId" IN (${missingMetadataIds} LIMIT ${METADATA_COPY_BATCH})
      ON CONFLICT DO NOTHING`.execute(db)
  } else {
    const room = queueSize - (await countQueuedJobs(modelId, db))
    if (room > 0) {
      await sql`
        INSERT INTO "EmbeddingsJobQueueV2" ("jobType", "priority", "embeddingsMetadataId", "modelId")
        SELECT 'embed:start', ${priority}, missing."embeddingsMetadataId", ${modelId}
        FROM (${missingMetadataIds}) missing
        WHERE NOT EXISTS (
          SELECT 1 FROM "EmbeddingsJobQueueV2" q
          WHERE q."embeddingsMetadataId" = missing."embeddingsMetadataId" AND q."modelId" = ${modelId}
        )
        ORDER BY missing."embeddingsMetadataId"
        LIMIT ${room}`.execute(db)
    }
  }
  const room = queueSize - (await countQueuedJobs(modelId, db))
  if (room > 0) {
    await sql`
      INSERT INTO "EmbeddingsJobQueueV2" ("jobType", "priority", "pageId", "modelId")
      SELECT 'embedPage:start', ${priority}, p.id, ${modelId} FROM "Page" p
      WHERE p."deletedAt" IS NULL
        AND EXISTS (SELECT 1 FROM ${sourcePages} s WHERE s."pageId" = p.id)
        AND NOT EXISTS (SELECT 1 FROM ${targetPages} t WHERE t."pageId" = p.id)
        AND NOT EXISTS (
          SELECT 1 FROM "EmbeddingsJobQueueV2" q WHERE q."pageId" = p.id AND q."modelId" = ${modelId}
        )
      ORDER BY p."updatedAt" DESC, p.id DESC
      LIMIT ${room}
      ON CONFLICT DO NOTHING`.execute(db)
  }
  return getEmbeddingsRunProgress(modelId, sourceModelId, db)
}
