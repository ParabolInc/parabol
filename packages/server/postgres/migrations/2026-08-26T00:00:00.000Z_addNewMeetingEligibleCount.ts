import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // How many people were expected to take part, captured when the meeting ends. Team membership
  // drifts, so recomputing this later would quietly rewrite history: a participation rate read off
  // today's roster tells you what the cycle would have scored if it ran now, not what it scored.
  await db.schema.alterTable('NewMeeting').addColumn('eligibleCount', 'smallint').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('NewMeeting').dropColumn('eligibleCount').execute()
}
