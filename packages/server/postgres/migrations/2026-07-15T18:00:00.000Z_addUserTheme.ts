import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('ThemeEnum').asEnum(['light', 'dark', 'system']).execute()
  await db.schema
    .alterTable('User')
    .addColumn('theme', sql`"ThemeEnum"`, (col) => col.defaultTo('system').notNull())
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('User').dropColumn('theme').execute()
  await db.schema.dropType('ThemeEnum').execute()
}
