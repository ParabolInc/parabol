import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await Promise.all([
    db.schema.dropTable('EmbeddingsJobQueue').ifExists().execute(),
    sql`
    DROP TRIGGER IF EXISTS "update_embedding_on_MeetingTemplate" ON "MeetingTemplate";
    DROP FUNCTION IF EXISTS "updateEmbedding"();
    DROP FUNCTION IF EXISTS "getEmbedderPriority"(integer);
    `.execute(db)
  ])
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // noop
}
