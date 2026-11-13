import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "RetroSuggestedGrouping" DROP COLUMN IF EXISTS "reasoningEffort"`.execute(
    db
  )
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "RetroSuggestedGrouping" ADD COLUMN IF NOT EXISTS "reasoningEffort" varchar(20)`.execute(
    db
  )
}
