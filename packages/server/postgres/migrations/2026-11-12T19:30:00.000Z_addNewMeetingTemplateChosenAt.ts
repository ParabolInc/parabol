import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "NewMeeting" ADD COLUMN IF NOT EXISTS "templateChosenAt" timestamptz`.execute(
    db
  )
  // Recurring retros used to copy the previous meeting's template; they now start from the series
  // template, so carry each active series' latest template onto the series to keep them unchanged
  await sql`
    UPDATE "MeetingSeries" s
    SET "templateId" = latest."templateId"
    FROM (
      SELECT DISTINCT ON ("meetingSeriesId") "meetingSeriesId", "templateId"
      FROM "NewMeeting"
      WHERE "meetingType" = 'retrospective' AND "meetingSeriesId" IS NOT NULL
      ORDER BY "meetingSeriesId", "createdAt" DESC
    ) latest
    WHERE s.id = latest."meetingSeriesId"
      AND s."meetingType" = 'retrospective'
      AND s."cancelledAt" IS NULL
      AND s."templateId" IS DISTINCT FROM latest."templateId"
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "NewMeeting" DROP COLUMN IF EXISTS "templateChosenAt"`.execute(db)
}
