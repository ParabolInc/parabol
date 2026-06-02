import type {Kysely} from 'kysely'

export async function up(_db: Kysely<any>): Promise<void> {
  // noop — the forward migration that introduces empty meeting series is on another branch
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('MeetingSeries')
    .where(({not, exists, selectFrom}) =>
      not(
        exists(
          selectFrom('NewMeeting')
            .select('id')
            .whereRef('NewMeeting.meetingSeriesId', '=', 'MeetingSeries.id')
        )
      )
    )
    .execute()
}
