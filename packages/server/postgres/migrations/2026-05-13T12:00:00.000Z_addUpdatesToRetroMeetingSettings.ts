import {type Kysely, sql} from 'kysely'

// Backfills the `updates` phase into every retrospective MeetingSettings row that does
// not already contain it. The phase is inserted immediately after the last index of
// 'checkin' or 'TEAM_HEALTH' (whichever appears later), or at index 0 when neither is
// present. After this runs, setMeetingSettings is the long-term ordering authority:
// any subsequent write canonicalizes the order to [checkin?, TEAM_HEALTH?, updates?, ...rest].
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    UPDATE "MeetingSettings"
    SET "phaseTypes" = (
      WITH idx AS (
        SELECT GREATEST(
          COALESCE(array_position("phaseTypes", 'checkin'::"NewMeetingPhaseTypeEnum"), 0),
          COALESCE(array_position("phaseTypes", 'TEAM_HEALTH'::"NewMeetingPhaseTypeEnum"), 0)
        ) AS pos
      )
      SELECT
        "phaseTypes"[1:idx.pos]
        || ARRAY['updates'::"NewMeetingPhaseTypeEnum"]
        || "phaseTypes"[idx.pos + 1:array_length("phaseTypes", 1)]
      FROM idx
    )
    WHERE "meetingType" = 'retrospective'
      AND NOT ('updates'::"NewMeetingPhaseTypeEnum" = ANY("phaseTypes"));
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    UPDATE "MeetingSettings"
    SET "phaseTypes" = array_remove("phaseTypes", 'updates'::"NewMeetingPhaseTypeEnum")
    WHERE "meetingType" = 'retrospective'
      AND 'updates'::"NewMeetingPhaseTypeEnum" = ANY("phaseTypes");
  `.execute(db)
}
