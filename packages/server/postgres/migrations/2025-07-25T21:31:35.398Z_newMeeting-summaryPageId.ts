import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('NewMeeting')
    .addColumn('summaryPageId', 'integer', (col) => col.references('Page.id').onDelete('set null'))
    .execute()
  await db.schema
    .createIndex('idx_NewMeeting_summaryPageId')
    .on('NewMeeting')
    .column('summaryPageId')
    .where('summaryPageId', 'is not', null)
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('NewMeeting').dropColumn('summaryPageId').execute()
}
