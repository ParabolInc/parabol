import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Page')
    .addColumn('isDatabase', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('Page').where('isDatabase', '=', true).execute()
  await db.schema.alterTable('Page').dropColumn('isDatabase').execute()
}
