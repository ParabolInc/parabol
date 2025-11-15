import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('PageAccessRequest')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('pageId', 'integer', (col) =>
      col.notNull().references('Page.id').onDelete('cascade')
    )
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('role', sql`"PageRoleEnum"`, (col) => col.notNull())
    .addColumn('reason', 'varchar(255)')
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addUniqueConstraint('PageAccessRequest_userId_pageId', ['userId', 'pageId'])
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('PageAccessRequest').execute()
}
