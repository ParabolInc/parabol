import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('ErrorFeedback')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    // nullable: unauthenticated users may submit; SET NULL survives user hard-delete
    .addColumn('userId', 'varchar(100)', (col) => col.references('User.id').onDelete('set null'))
    .addColumn('email', 'varchar(255)')
    .addColumn('errorMessage', 'varchar(2000)', (col) => col.notNull())
    .addColumn('content', 'varchar(2000)', (col) => col.notNull())
    // client-generated crypto.randomUUID(), correlates with Datadog RUM
    .addColumn('eventId', 'varchar(43)')
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('ErrorFeedback').ifExists().execute()
}
