import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "MeetingSeries" ADD COLUMN IF NOT EXISTS "disableAnonymity" boolean`.execute(
    db
  )
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "MeetingSeries" DROP COLUMN IF EXISTS "disableAnonymity"`.execute(db)
}
