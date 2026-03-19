import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Backfill summaryMeetingId for pages created after the regression
  // in commit 16938b7700 (2026-02-23) which dropped the field from
  // the createNewPage call in publishSummaryPage.ts
  await db
    .updateTable('Page')
    .from('NewMeeting')
    .set((eb) => ({summaryMeetingId: eb.ref('NewMeeting.id')}))
    .whereRef('NewMeeting.summaryPageId', '=', 'Page.id')
    .where('summaryMeetingId', 'is', null)
    .execute()
}

export async function down(): Promise<void> {
  // noop
}
