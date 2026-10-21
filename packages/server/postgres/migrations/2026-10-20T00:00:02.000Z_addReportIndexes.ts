import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // large instances should build these CONCURRENTLY by hand before deploying, which makes this a no-op
  await db.schema
    .createIndex('idx_NewMeeting_teamId_createdAt')
    .ifNotExists()
    .on('NewMeeting')
    .columns(['teamId', 'createdAt'])
    .execute()
  await db.schema
    .createIndex('idx_Task_teamId_createdAt')
    .ifNotExists()
    .on('Task')
    .columns(['teamId', 'createdAt'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_NewMeeting_teamId_createdAt').ifExists().execute()
  await db.schema.dropIndex('idx_Task_teamId_createdAt').ifExists().execute()
}
