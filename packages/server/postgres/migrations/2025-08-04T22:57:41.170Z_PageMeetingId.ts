import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Page')
    .addColumn('summaryMeetingId', 'varchar(100)', (col) =>
      col.references('NewMeeting.id').onDelete('set null')
    )
    .execute()
  await db.schema
    .createIndex('idx_Page_summaryMeetingId')
    .on('Page')
    .column('summaryMeetingId')
    .where('summaryMeetingId', 'is not', null)
    .execute()

  // Update all matching pages by joining on pageId
  await db
    .updateTable('Page')
    .set({
      summaryMeetingId: db
        .selectFrom('NewMeeting')
        .select('NewMeeting.id')
        .whereRef('NewMeeting.summaryPageId', '=', 'Page.id')
        .limit(1)
    })
    .where(({exists}) =>
      exists(
        db
          .selectFrom('NewMeeting')
          .select('id')
          .whereRef('NewMeeting.summaryPageId', '=', 'Page.id')
      )
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Page').dropColumn('summaryMeetingId').execute()
}
