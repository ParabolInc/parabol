import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // a retro's Team Health phase now shows the team's Team Health check instead of the one-question
  // pulse that most teams had on by default, so every team starts with it off
  await sql`
    UPDATE "MeetingSettings"
    SET "phaseTypes" = array_remove("phaseTypes", 'TEAM_HEALTH')
    WHERE "meetingType" = 'retrospective' AND 'TEAM_HEALTH' = ANY("phaseTypes")
  `.execute(db)
}

// nothing records which teams had the pulse on, and the pulse no longer runs
export async function down(): Promise<void> {}
