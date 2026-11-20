import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "OrganizationUser" ADD COLUMN IF NOT EXISTS "reportsViewedAt" timestamptz`.execute(
    db
  )
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "OrganizationUser" DROP COLUMN IF EXISTS "reportsViewedAt"`.execute(db)
}
