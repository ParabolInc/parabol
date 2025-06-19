import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('PageBacklink')
    .addColumn('fromPageId', 'serial', (col) =>
      col.references('Page.id').onDelete('cascade').notNull()
    )
    .addColumn('toPageId', 'serial', (col) =>
      col.references('Page.id').onDelete('cascade').notNull()
    )
    .addPrimaryKeyConstraint('PageBacklink_pk', ['fromPageId', 'toPageId'])
    .execute()
  await Promise.all([
    db.schema
      .createIndex('idx_PageBacklink_fromPageId')
      .on('PageBacklink')
      .column('fromPageId')
      .execute(),
    db.schema
      .createIndex('idx_PageBacklink_toPageId')
      .on('PageBacklink')
      .column('toPageId')
      .execute()
  ])
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('PageBacklink').execute()
}
