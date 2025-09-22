import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
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

export async function down(): Promise<void> {
  // noop
}
