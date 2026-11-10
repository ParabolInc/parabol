import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Page')
    .addColumn('isSyncedBlock', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()
  await db.schema
    .alterTable('PageBacklink')
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('PageBacklink').dropColumn('createdAt').execute()
  await db.schema.alterTable('Page').dropColumn('isSyncedBlock').execute()
}
