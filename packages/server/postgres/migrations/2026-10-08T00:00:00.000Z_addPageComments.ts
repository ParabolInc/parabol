import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('PageThread')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('pageId', 'integer', (col) =>
      col.notNull().references('Page.id').onDelete('cascade')
    )
    .addColumn('quote', 'varchar(500)', (col) => col.notNull().defaultTo(''))
    .addColumn('resolvedAt', 'timestamptz')
    .addColumn('resolvedBy', 'varchar(100)', (col) =>
      col.references('User.id').onDelete('set null')
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
  await db.schema
    .createIndex('idx_PageThread_pageId')
    .ifNotExists()
    .on('PageThread')
    .column('pageId')
    .execute()

  await db.schema
    .createTable('PageComment')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('threadId', 'integer', (col) =>
      col.notNull().references('PageThread.id').onDelete('cascade')
    )
    .addColumn('content', 'jsonb', (col) => col.notNull())
    .addColumn('plaintextContent', 'varchar(2000)', (col) => col.notNull())
    .addColumn('createdBy', 'varchar(100)', (col) => col.references('User.id').onDelete('set null'))
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
  await db.schema
    .createIndex('idx_PageComment_threadId')
    .ifNotExists()
    .on('PageComment')
    .column('threadId')
    .execute()

  await sql`
    CREATE OR REPLACE TRIGGER "update_PageThread_updatedAt"
    BEFORE UPDATE ON "PageThread"
    FOR EACH ROW
    EXECUTE FUNCTION "set_updatedAt"();
  `.execute(db)
  await sql`
    CREATE OR REPLACE TRIGGER "update_PageComment_updatedAt"
    BEFORE UPDATE ON "PageComment"
    FOR EACH ROW
    EXECUTE FUNCTION "set_updatedAt"();
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('PageComment').ifExists().execute()
  await db.schema.dropTable('PageThread').ifExists().execute()
}
