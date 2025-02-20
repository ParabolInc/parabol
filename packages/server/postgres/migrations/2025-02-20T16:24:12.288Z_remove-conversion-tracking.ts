import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('NewMeeting').dropColumn('showConversionModal').execute()
  await db.schema.alterTable('User').dropColumn('payLaterClickCount').execute()
  await db.schema.alterTable('Organization').dropColumn('payLaterClickCount').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('NewMeeting')
    .addColumn('showConversionModal', 'boolean', (col) => col.defaultTo(false))
    .execute()
  await db.schema
    .alterTable('User')
    .addColumn('payLaterClickCount', 'integer', (col) => col.defaultTo(0))
    .execute()
  await db.schema
    .alterTable('Organization')
    .addColumn('payLaterClickCount', 'integer', (col) => col.defaultTo(0))
    .execute()
}
