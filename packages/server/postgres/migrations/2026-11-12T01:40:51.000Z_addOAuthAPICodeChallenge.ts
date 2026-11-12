import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "OAuthAPICode" ADD COLUMN IF NOT EXISTS "codeChallenge" varchar(43)`.execute(
    db
  )
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "OAuthAPICode" DROP COLUMN IF EXISTS "codeChallenge"`.execute(db)
}
