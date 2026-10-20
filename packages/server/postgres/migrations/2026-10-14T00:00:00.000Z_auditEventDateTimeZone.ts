import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // eventDate was the only column without a time zone. Servers run in UTC, so existing values are read as UTC
  await sql`ALTER TABLE "OrganizationUserAudit" ALTER COLUMN "eventDate" TYPE timestamptz`.execute(
    db
  )
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "OrganizationUserAudit" ALTER COLUMN "eventDate" TYPE timestamp`.execute(db)
}
