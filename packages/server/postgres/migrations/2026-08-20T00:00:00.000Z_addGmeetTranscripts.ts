import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE public."ScheduledJobTypeEnum" ADD VALUE IF NOT EXISTS 'MEET_TRANSCRIPT'`.execute(
    db
  )
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" RENAME VALUE 'gdrive' TO 'gmeet'`.execute(
    db
  )
  await db
    .updateTable('IntegrationProvider')
    .set({serverBaseUrl: 'https://meet.googleapis.com/v2'})
    .where('service', '=', 'gmeet')
    .execute()
  // existing tokens were granted drive.meet.readonly, which the Meet REST API rejects. Deactivating
  // puts the team member back to a Connect button so they consent to meetings.space.readonly, and
  // reconnecting flips isActive back to true
  await db
    .updateTable('TeamMemberIntegrationAuth')
    .set({isActive: false})
    .where('service', '=', 'gmeet')
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('IntegrationProvider')
    .set({serverBaseUrl: 'https://www.googleapis.com/drive/v3'})
    .where('service', '=', 'gmeet')
    .execute()
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" RENAME VALUE 'gmeet' TO 'gdrive'`.execute(
    db
  )
  // pg cannot drop a single enum value; recreating the type would rewrite every row in
  // ScheduledJob under an ACCESS EXCLUSIVE lock, so the value is left in place
}
