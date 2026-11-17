import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('SAML').dropConstraint('SAML_orgId_key').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    UPDATE "SAML"
    SET "orgId" = NULL
    WHERE "id" IN (
      SELECT "id"
      FROM (
        SELECT
          "id",
          row_number() OVER (PARTITION BY "orgId" ORDER BY "createdAt", "id") AS "orgRank"
        FROM "SAML"
        WHERE "orgId" IS NOT NULL
      ) "ranked"
      WHERE "orgRank" > 1
    )
  `.execute(db)
  await db.schema.alterTable('SAML').addUniqueConstraint('SAML_orgId_key', ['orgId']).execute()
}
