import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('OAuthClientTypeEnum').asEnum(['confidential', 'public']).execute()
  await db.schema
    .alterTable('OAuthAPIProvider')
    .addColumn('clientType', sql`"OAuthClientTypeEnum"`, (col) =>
      col.notNull().defaultTo('confidential')
    )
    .execute()
  await db.schema
    .alterTable('OAuthAPIProvider')
    .alterColumn('clientSecret', (col) => col.dropNotNull())
    .execute()
  await sql`
    ALTER TABLE "OAuthAPIProvider"
    ADD CONSTRAINT "OAuthAPIProvider_secret_matches_type"
    CHECK (("clientType" = 'public') = ("clientSecret" IS NULL))
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('OAuthAPIProvider').where('clientType', '=', 'public').execute()
  await sql`
    ALTER TABLE "OAuthAPIProvider" DROP CONSTRAINT "OAuthAPIProvider_secret_matches_type"
  `.execute(db)
  await db.schema
    .alterTable('OAuthAPIProvider')
    .alterColumn('clientSecret', (col) => col.setNotNull())
    .execute()
  await db.schema.alterTable('OAuthAPIProvider').dropColumn('clientType').execute()
  await db.schema.dropType('OAuthClientTypeEnum').execute()
}
