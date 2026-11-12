import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "NewMeeting" ADD COLUMN IF NOT EXISTS "templateChosenAt" timestamptz`.execute(
    db
  )
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "NewMeeting" DROP COLUMN IF EXISTS "templateChosenAt"`.execute(db)
}
