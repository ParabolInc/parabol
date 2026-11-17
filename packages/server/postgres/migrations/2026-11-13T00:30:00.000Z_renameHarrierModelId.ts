import {type Kysely, sql} from 'kysely'

// Harrier's id becomes that of the INT8 build TEI serves. Its tables keep their names.
// Migrations run before the deploy replaces the embedder, and until then the old embedder knows only the old id and
// fails any job it can't find a model for. So renamed jobs that are waiting stay put for 10 minutes, until it's gone.
// `any` is required here since migrations should be frozen in time.
const MICROSOFT_ID = 'microsoft/harrier-oss-v1-270m'
const PARABOL_ID = 'Parabol/harrier-oss-v1-270m-ONNX-INT8'

const renameModelId = async (db: Kysely<any>, from: string, to: string) => {
  // A page has one job per model, so where a page has a job under both ids, keep the one under the new id
  await sql`
    DELETE FROM "EmbeddingsJobQueueV2" q
    WHERE q."modelId" = ${from}
      AND q."pageId" IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM "EmbeddingsJobQueueV2" twin
        WHERE twin."pageId" = q."pageId" AND twin."modelId" = ${to}
      )
  `.execute(db)
  await sql`
    UPDATE "EmbeddingsJobQueueV2"
    SET
      "modelId" = ${to},
      "runAfter" = CASE
        WHEN "state" = 'queued' THEN GREATEST("runAfter", now() + interval '10 minutes')
        ELSE "runAfter"
      END
    WHERE "modelId" = ${from}
  `.execute(db)
  await sql`UPDATE "EmbeddingsFailures" SET "modelId" = ${to} WHERE "modelId" = ${from}`.execute(db)
}

export async function up(db: Kysely<any>): Promise<void> {
  await renameModelId(db, MICROSOFT_ID, PARABOL_ID)
}

export async function down(db: Kysely<any>): Promise<void> {
  await renameModelId(db, PARABOL_ID, MICROSOFT_ID)
}
