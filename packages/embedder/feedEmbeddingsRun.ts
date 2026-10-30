import {type Kysely, sql} from 'kysely'
import getKysely from '../server/postgres/getKysely'
import type {DB} from '../server/postgres/types/pg'
import {embeddingModelIds} from './activeEmbeddingModel'
import type {ModelId} from './ai_models/modelIdDefinitions'
import type {EmbeddingsRun} from './embeddingsRun'
import {getEmbedderJobPriority} from './getEmbedderJobPriority'
import {getEmbeddingsPagesTableName, getEmbeddingsTableName} from './getEmbeddingsTableName'

const METADATA_COPY_BATCH = 10_000

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

export interface FedEmbeddingsRun {
  run: EmbeddingsRun
  pages: number
  metadataRows: number
}

export const feedEmbeddingsRun = async (
  run: EmbeddingsRun | null,
  db: Kysely<DB> = getKysely()
): Promise<FedEmbeddingsRun | null> => {
  if (!run || run.state !== 'running' || (run.pagesDone && run.metadataDone)) return null
  const {modelId, sourceModelId, copyMetadata, queueSize} = run
  const isConfigured =
    embeddingModelIds.includes(modelId) && embeddingModelIds.includes(sourceModelId)
  if (!isConfigured || modelId === sourceModelId) return null
  const sourcePages = sql.id(getEmbeddingsPagesTableName(sourceModelId)!)
  const targetPages = sql.id(getEmbeddingsPagesTableName(modelId)!)
  const sourceMetadata = sql.id(getEmbeddingsTableName(sourceModelId))
  const targetMetadata = sql.id(getEmbeddingsTableName(modelId))
  const priority = await getEmbedderJobPriority('modelUpdate', null, 0)
  const next = {...run}
  let metadataRows = 0
  if (!run.metadataDone && copyMetadata) {
    const {numAffectedRows} = await sql`
      INSERT INTO ${targetMetadata} ("embedText", "tsv", "embedding", "embeddingsMetadataId", "chunkNumber")
      SELECT "embedText", "tsv", "embedding", "embeddingsMetadataId", "chunkNumber" FROM ${sourceMetadata}
      WHERE "embeddingsMetadataId" IN (
        SELECT DISTINCT s."embeddingsMetadataId" FROM ${sourceMetadata} s
        WHERE NOT EXISTS (
          SELECT 1 FROM ${targetMetadata} t WHERE t."embeddingsMetadataId" = s."embeddingsMetadataId"
        )
        LIMIT ${METADATA_COPY_BATCH}
      )
      ON CONFLICT DO NOTHING`.execute(db)
    metadataRows = Number(numAffectedRows ?? 0)
    next.metadataDone = metadataRows === 0
  } else if (!run.metadataDone) {
    const room = queueSize - (await countQueuedJobs(modelId, db))
    if (room > 0) {
      const {
        rows: [batch]
      } = await sql<{count: number; cursor: number | null}>`
        WITH batch AS (
          SELECT DISTINCT s."embeddingsMetadataId" AS id FROM ${sourceMetadata} s
          WHERE s."embeddingsMetadataId" > ${run.metadataCursor ?? 0}
            AND NOT EXISTS (
              SELECT 1 FROM ${targetMetadata} t WHERE t."embeddingsMetadataId" = s."embeddingsMetadataId"
            )
          ORDER BY 1
          LIMIT ${room}
        ), queued AS (
          INSERT INTO "EmbeddingsJobQueueV2" ("jobType", "priority", "embeddingsMetadataId", "modelId")
          SELECT 'embed:start', ${priority}, b.id, ${modelId} FROM batch b
          WHERE NOT EXISTS (
            SELECT 1 FROM "EmbeddingsJobQueueV2" q
            WHERE q."embeddingsMetadataId" = b.id AND q."modelId" = ${modelId}
          )
          ORDER BY b.id
        )
        SELECT count(*)::int AS count, max(id) AS cursor FROM batch`.execute(db)
      metadataRows = batch!.count
      next.metadataCursor = batch!.cursor ?? run.metadataCursor
      next.metadataDone = batch!.count === 0
    }
  }
  let pages = 0
  const room = queueSize - (await countQueuedJobs(modelId, db))
  if (!run.pagesDone && room > 0) {
    const [cursorUpdatedAt, cursorId] = run.pageCursor?.split('|') ?? [null, null]
    const {
      rows: [batch]
    } = await sql<{count: number; cursor: string | null}>`
      WITH batch AS (
        SELECT p.id, p."updatedAt" FROM "Page" p
        WHERE p."deletedAt" IS NULL
          AND (
            ${cursorUpdatedAt}::timestamptz IS NULL
            OR (p."updatedAt", p.id) < (${cursorUpdatedAt}::timestamptz, ${cursorId}::int)
          )
          AND EXISTS (SELECT 1 FROM ${sourcePages} s WHERE s."pageId" = p.id)
          AND NOT EXISTS (SELECT 1 FROM ${targetPages} t WHERE t."pageId" = p.id)
        ORDER BY p."updatedAt" DESC, p.id DESC
        LIMIT ${room}
      ), queued AS (
        INSERT INTO "EmbeddingsJobQueueV2" ("jobType", "priority", "pageId", "modelId")
        SELECT 'embedPage:start', ${priority}, b.id, ${modelId} FROM batch b
        WHERE NOT EXISTS (
          SELECT 1 FROM "EmbeddingsJobQueueV2" q WHERE q."pageId" = b.id AND q."modelId" = ${modelId}
        )
        ORDER BY b."updatedAt" DESC, b.id DESC
        ON CONFLICT DO NOTHING
      )
      SELECT
        count(*)::int AS count,
        (array_agg(b."updatedAt"::text || '|' || b.id ORDER BY b."updatedAt", b.id))[1] AS cursor
      FROM batch b`.execute(db)
    pages = batch!.count
    next.pageCursor = batch!.cursor ?? run.pageCursor
    next.pagesDone = batch!.count === 0
  }
  return {run: next, pages, metadataRows}
}
