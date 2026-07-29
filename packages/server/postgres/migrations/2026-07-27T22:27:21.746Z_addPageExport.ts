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
    .addColumn('teamId', 'varchar(100)', (col) =>
      col.notNull().references('Team.id').onDelete('cascade')
    )
    .addColumn('service', 'varchar(50)', (col) => col.notNull().defaultTo('confluence'))
    .addColumn('cloudId', 'varchar(120)', (col) => col.notNull())
    .addColumn('spaceId', 'varchar(120)', (col) => col.notNull())
    .addColumn('spaceName', 'varchar(255)', (col) => col.notNull())
    .addColumn('targetParentPageId', 'varchar(120)')
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
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('PageExport').ifExists().execute()
}
