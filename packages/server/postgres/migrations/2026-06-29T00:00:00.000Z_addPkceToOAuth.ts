import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('OAuthAPICode')
    .addColumn('codeChallenge', 'varchar(128)')
    .addColumn('codeChallengeMethod', 'varchar(10)')
    .execute()

  await db.schema
    .alterTable('OAuthAPIProvider')
    .addColumn('isPublicClient', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await sql`ALTER TABLE "OAuthAPIProvider" ALTER COLUMN "clientSecret" DROP NOT NULL`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`UPDATE "OAuthAPIProvider" SET "clientSecret" = '' WHERE "clientSecret" IS NULL`.execute(
    db
  )
  await sql`ALTER TABLE "OAuthAPIProvider" ALTER COLUMN "clientSecret" SET NOT NULL`.execute(db)
  await db.schema.alterTable('OAuthAPIProvider').dropColumn('isPublicClient').execute()
  await db.schema
    .alterTable('OAuthAPICode')
    .dropColumn('codeChallengeMethod')
    .dropColumn('codeChallenge')
    .execute()
}
