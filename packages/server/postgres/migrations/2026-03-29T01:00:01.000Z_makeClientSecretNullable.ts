import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "OAuthAPIProvider" ALTER COLUMN "clientSecret" DROP NOT NULL`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`UPDATE "OAuthAPIProvider" SET "clientSecret" = '' WHERE "clientSecret" IS NULL`.execute(
    db
  )
  await sql`ALTER TABLE "OAuthAPIProvider" ALTER COLUMN "clientSecret" SET NOT NULL`.execute(db)
}
