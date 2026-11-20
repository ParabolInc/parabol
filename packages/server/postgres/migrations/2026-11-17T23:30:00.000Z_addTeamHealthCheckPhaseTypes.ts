import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // ADD VALUE is O(1) and must commit before anything uses the value
  for (const phaseType of ['TEAM_HEALTH_CHECK', 'TEAM_HEALTH_CHECK_RESULT']) {
    await sql`ALTER TYPE public."NewMeetingPhaseTypeEnum" ADD VALUE IF NOT EXISTS ${sql.lit(phaseType)}`.execute(
      db
    )
  }
}

// Postgres cannot drop a value from an enum, and the phases JSON of past retros may hold these types
export async function down(): Promise<void> {}
