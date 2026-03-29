import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Replace the old 2-value OAuthScopeEnum with resource-based scopes.
  // Postgres doesn't allow subqueries in ALTER COLUMN TYPE USING, so we
  // use a temp text[] column to hold the mapped values during the swap.

  // 1. Create new enum type
  await db.schema
    .createType('OAuthScopeEnumV2')
    .asEnum([
      'read',
      'write',
      'meetings_read',
      'meetings_write',
      'teams_read',
      'teams_write',
      'tasks_read',
      'tasks_write',
      'users_read',
      'users_write',
      'org_read',
      'org_write',
      'org_admin',
      'templates_read',
      'templates_write',
      'pages_read',
      'pages_write',
      'pages_admin',
      'comments_read',
      'comments_write'
    ])
    .execute()

  // 2. Migrate OAuthAPIProvider.scopes
  // Add temp column, populate it, drop old column, rename
  await sql`ALTER TABLE "OAuthAPIProvider" ADD COLUMN "scopesNew" "OAuthScopeEnumV2"[]`.execute(db)
  await sql`
    UPDATE "OAuthAPIProvider" SET "scopesNew" = (
      SELECT array_agg(
        CASE v
          WHEN 'graphql:query' THEN 'read'::"OAuthScopeEnumV2"
          WHEN 'graphql:mutation' THEN 'write'::"OAuthScopeEnumV2"
        END
      )
      FROM unnest("scopes") AS v
    )
  `.execute(db)
  await sql`ALTER TABLE "OAuthAPIProvider" DROP COLUMN "scopes"`.execute(db)
  await sql`ALTER TABLE "OAuthAPIProvider" RENAME COLUMN "scopesNew" TO "scopes"`.execute(db)
  await sql`ALTER TABLE "OAuthAPIProvider" ALTER COLUMN "scopes" SET NOT NULL`.execute(db)

  // 3. Migrate OAuthAPICode.scopes if it exists
  const codeTableExists = await sql<{exists: boolean}>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'OAuthAPICode' AND column_name = 'scopes'
    ) as exists
  `.execute(db)
  if (codeTableExists.rows[0]?.exists) {
    await sql`ALTER TABLE "OAuthAPICode" ADD COLUMN "scopesNew" "OAuthScopeEnumV2"[]`.execute(db)
    await sql`
      UPDATE "OAuthAPICode" SET "scopesNew" = (
        SELECT array_agg(
          CASE v
            WHEN 'graphql:query' THEN 'read'::"OAuthScopeEnumV2"
            WHEN 'graphql:mutation' THEN 'write'::"OAuthScopeEnumV2"
          END
        )
        FROM unnest("scopes") AS v
      )
    `.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" DROP COLUMN "scopes"`.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" RENAME COLUMN "scopesNew" TO "scopes"`.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" ALTER COLUMN "scopes" SET NOT NULL`.execute(db)
  }

  // 4. Drop old enum, rename new one
  await sql`DROP TYPE IF EXISTS "OAuthScopeEnum"`.execute(db)
  await sql`ALTER TYPE "OAuthScopeEnumV2" RENAME TO "OAuthScopeEnum"`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('OAuthScopeEnumOld')
    .asEnum(['graphql:query', 'graphql:mutation'])
    .execute()

  await sql`ALTER TABLE "OAuthAPIProvider" ADD COLUMN "scopesOld" "OAuthScopeEnumOld"[]`.execute(db)
  await sql`
    UPDATE "OAuthAPIProvider" SET "scopesOld" = (
      SELECT array_agg(
        CASE
          WHEN v IN ('read', 'meetings_read', 'teams_read', 'tasks_read', 'users_read', 'org_read', 'templates_read', 'pages_read', 'comments_read') THEN 'graphql:query'::"OAuthScopeEnumOld"
          ELSE 'graphql:mutation'::"OAuthScopeEnumOld"
        END
      )
      FROM unnest("scopes") AS v
    )
  `.execute(db)
  await sql`ALTER TABLE "OAuthAPIProvider" DROP COLUMN "scopes"`.execute(db)
  await sql`ALTER TABLE "OAuthAPIProvider" RENAME COLUMN "scopesOld" TO "scopes"`.execute(db)
  await sql`ALTER TABLE "OAuthAPIProvider" ALTER COLUMN "scopes" SET NOT NULL`.execute(db)

  const codeTableExists = await sql<{exists: boolean}>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'OAuthAPICode' AND column_name = 'scopes'
    ) as exists
  `.execute(db)
  if (codeTableExists.rows[0]?.exists) {
    await sql`ALTER TABLE "OAuthAPICode" ADD COLUMN "scopesOld" "OAuthScopeEnumOld"[]`.execute(db)
    await sql`
      UPDATE "OAuthAPICode" SET "scopesOld" = (
        SELECT array_agg(
          CASE
            WHEN v IN ('read', 'meetings_read', 'teams_read', 'tasks_read', 'users_read', 'org_read', 'templates_read', 'pages_read', 'comments_read') THEN 'graphql:query'::"OAuthScopeEnumOld"
            ELSE 'graphql:mutation'::"OAuthScopeEnumOld"
          END
        )
        FROM unnest("scopes") AS v
      )
    `.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" DROP COLUMN "scopes"`.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" RENAME COLUMN "scopesOld" TO "scopes"`.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" ALTER COLUMN "scopes" SET NOT NULL`.execute(db)
  }

  await sql`DROP TYPE IF EXISTS "OAuthScopeEnum"`.execute(db)
  await sql`ALTER TYPE "OAuthScopeEnumOld" RENAME TO "OAuthScopeEnum"`.execute(db)
}
