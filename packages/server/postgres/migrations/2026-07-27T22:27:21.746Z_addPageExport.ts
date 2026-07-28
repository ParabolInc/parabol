import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('PageExport')
    .ifNotExists()
    .addColumn('id', 'bigserial', (col) => col.primaryKey())
    .addColumn('pageId', 'integer', (col) =>
      col.notNull().references('Page.id').onDelete('cascade')
    )
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('service', 'varchar(50)', (col) => col.notNull().defaultTo('confluence'))
    .addColumn('cloudId', 'varchar(120)', (col) => col.notNull())
    .addColumn('spaceId', 'varchar(120)', (col) => col.notNull())
    .addColumn('spaceName', 'varchar(255)', (col) => col.notNull())
    .addColumn('parentPageId', 'varchar(120)')
    .addColumn('includeSubPages', 'boolean', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('running'))
    .addColumn('rootTargetPageId', 'varchar(120)')
    .addColumn('rootTargetUrl', 'varchar(2000)')
    .addColumn('pagesJson', 'jsonb', (col) => col.notNull())
    .addColumn('degradedJson', 'jsonb', (col) => col.notNull().defaultTo(sql`'[]'::jsonb`))
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
  await db.schema
    .createIndex('idx_PageExport_pageId')
    .ifNotExists()
    .on('PageExport')
    .column('pageId')
    .execute()
  await db.schema
    .createIndex('idx_PageExport_userId')
    .ifNotExists()
    .on('PageExport')
    .column('userId')
    .execute()
  await sql`ALTER TYPE "NotificationTypeEnum" ADD VALUE IF NOT EXISTS 'PAGE_EXPORT_COMPLETE'`.execute(
    db
  )
  await sql`ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "pageExportId" bigint`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "Notification" DROP COLUMN IF EXISTS "pageExportId"`.execute(db)
  await db.schema.dropTable('PageExport').ifExists().execute()
  // enum values cannot be removed from NotificationTypeEnum; PAGE_EXPORT_COMPLETE stays (harmless)
}
