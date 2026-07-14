import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('TaskSecondaryStatus')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('teamId', 'varchar(100)', (col) =>
      col.references('Team.id').onDelete('cascade').notNull()
    )
    // the parent primary status; a secondary always belongs to exactly one primary band
    .addColumn('status', sql`"TaskStatusEnum"`, (col) => col.notNull())
    .addColumn('label', 'varchar(100)', (col) => col.notNull())
    .addColumn('sortOrder', 'double precision', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute()
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "idx_TaskSecondaryStatus_teamId_status_lowerLabel"
    ON "TaskSecondaryStatus" ("teamId", "status", lower("label"))
  `.execute(db)
  await sql`
    CREATE TRIGGER "update_TaskSecondaryStatus_updatedAt"
    BEFORE UPDATE ON "TaskSecondaryStatus"
    FOR EACH ROW EXECUTE FUNCTION "set_updatedAt"()
  `.execute(db)
  await db.schema
    .alterTable('Task')
    .addColumn('secondaryStatusId', 'integer', (col) =>
      col.references('TaskSecondaryStatus.id').onDelete('set null')
    )
    .execute()
  await db.schema
    .createIndex('idx_Task_teamId_status')
    .ifNotExists()
    .on('Task')
    .columns(['teamId', 'status'])
    .execute()
  await sql`
    CREATE INDEX IF NOT EXISTS "idx_Task_secondaryStatusId"
    ON "Task" ("secondaryStatusId") WHERE "secondaryStatusId" IS NOT NULL
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Task').dropColumn('secondaryStatusId').execute()
  await db.schema.dropIndex('idx_Task_teamId_status').ifExists().execute()
  await db.schema.dropTable('TaskSecondaryStatus').ifExists().execute()
}
