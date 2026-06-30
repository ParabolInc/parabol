import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('InspirationItem')
    .ifNotExists()
    .addColumn('id', 'bigserial', (col) => col.primaryKey())
    .addColumn('meetingId', 'varchar(100)', (col) =>
      col.notNull().references('NewMeeting.id').onDelete('cascade')
    )
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('service', 'varchar(255)', (col) => col.notNull())
    .addColumn('title', 'varchar(255)')
    // tiptap doc (OpenAI markdown converted at write time), consistent with TeamPromptResponse.content
    .addColumn('content', 'jsonb', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  // Items are looked up and replaced per (meeting, viewer, service)
  await db.schema
    .createIndex('idx_InspirationItem_meetingId_userId_service')
    .ifNotExists()
    .on('InspirationItem')
    .columns(['userId', 'meetingId', 'service'])
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('InspirationItem').ifExists().execute()
}
