import {type Kysely, sql} from 'kysely'

// The meeting template embedding text changed. A null fullText makes the embedder rebuild it before re-embedding.
// `any` is required here since migrations should be frozen in time.
export async function up(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('EmbeddingsMetadata')
    .set({fullText: null})
    .where('objectType', '=', 'meetingTemplate')
    .execute()

  const embeddingModels: {model: string}[] = JSON.parse(process.env.AI_EMBEDDING_MODELS || '[]')
  const modelIds = embeddingModels.map(({model}) => model.split(':')[1]).filter(Boolean)
  if (modelIds.length === 0) return

  const HISTORICAL_UPDATE_PRIORITY = 400_000_000
  const priority =
    HISTORICAL_UPDATE_PRIORITY +
    Math.floor(Date.now() / 1000) -
    Math.floor(new Date('2026-01-01').getTime() / 1000)

  await sql`
    INSERT INTO "EmbeddingsJobQueueV2" ("jobType", "priority", "embeddingsMetadataId", "modelId")
    SELECT 'embed:start', ${priority}, "EmbeddingsMetadata"."id", "model"."modelId"
    FROM "EmbeddingsMetadata"
    CROSS JOIN UNNEST(ARRAY[${sql.join(modelIds)}]::varchar[]) AS "model"("modelId")
    WHERE "EmbeddingsMetadata"."objectType" = 'meetingTemplate'
  `.execute(db)
}

export async function down(): Promise<void> {}
