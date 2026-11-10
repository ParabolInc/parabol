import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "TeamMemberIntegrationAuth" ADD COLUMN IF NOT EXISTS "expiredAt" timestamptz`.execute(
    db
  )
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "TeamMemberIntegrationAuth" DROP COLUMN IF EXISTS "expiredAt"`.execute(db)
}
