import {type Kysely, sql} from 'kysely'

const READ_SCOPES = [
  'meetings:read',
  'teams:read',
  'tasks:read',
  'users:read',
  'org:read',
  'templates:read',
  'pages:read',
  'comments:read'
]

const WRITE_SCOPES = [
  'meetings:write',
  'teams:write',
  'tasks:write',
  'users:write',
  'org:write',
  'templates:write',
  'pages:write',
  'comments:write'
]

const ALL_SCOPES = [...READ_SCOPES, ...WRITE_SCOPES]

export async function up(db: Kysely<any>): Promise<void> {
  // Replace the old 2-value OAuthScopeEnum with resource-based scopes.
  // Postgres doesn't allow subqueries in ALTER COLUMN TYPE USING, so we
  // use a temp text[] column to hold the mapped values during the swap.

  // 1. Create new enum type (no global read/write aliases — only resource:action scopes)
  await db.schema.createType('OAuthScopeEnumV2').asEnum(ALL_SCOPES).execute()

  // 2. Migrate OAuthAPIProvider.scopes
  // graphql:query  → all :read scopes
  // graphql:mutation → all :write scopes
  await sql`ALTER TABLE "OAuthAPIProvider" ADD COLUMN "scopesNew" "OAuthScopeEnumV2"[]`.execute(db)
  await sql`
    UPDATE "OAuthAPIProvider" SET "scopesNew" = (
      SELECT array_agg(DISTINCT ns ORDER BY ns)::"OAuthScopeEnumV2"[]
      FROM (
        SELECT unnest(
          CASE v
            WHEN 'graphql:query'    THEN ${sql.raw(`ARRAY[${READ_SCOPES.map((s) => `'${s}'`).join(',')}]`)}
            WHEN 'graphql:mutation' THEN ${sql.raw(`ARRAY[${WRITE_SCOPES.map((s) => `'${s}'`).join(',')}]`)}
          END
        ) AS ns
        FROM unnest("scopes") AS v
      ) subq
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
        SELECT array_agg(DISTINCT ns ORDER BY ns)::"OAuthScopeEnumV2"[]
        FROM (
          SELECT unnest(
            CASE v
              WHEN 'graphql:query'    THEN ${sql.raw(`ARRAY[${READ_SCOPES.map((s) => `'${s}'`).join(',')}]`)}
              WHEN 'graphql:mutation' THEN ${sql.raw(`ARRAY[${WRITE_SCOPES.map((s) => `'${s}'`).join(',')}]`)}
            END
          ) AS ns
          FROM unnest("scopes") AS v
        ) subq
      )
    `.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" DROP COLUMN "scopes"`.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" RENAME COLUMN "scopesNew" TO "scopes"`.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" ALTER COLUMN "scopes" SET NOT NULL`.execute(db)
  }

  // 4. Drop old enum, rename new one
  await sql`DROP TYPE IF EXISTS "OAuthScopeEnum"`.execute(db)
  await sql`ALTER TYPE "OAuthScopeEnumV2" RENAME TO "OAuthScopeEnum"`.execute(db)

  // 5. Add clientType as a proper enum (confidential | public) and make clientSecret nullable
  await db.schema.createType('OAuthClientTypeEnum').asEnum(['confidential', 'public']).execute()
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'OAuthAPIProvider' AND column_name = 'clientType'
      ) THEN
        ALTER TABLE "OAuthAPIProvider"
          ADD COLUMN "clientType" "OAuthClientTypeEnum" NOT NULL DEFAULT 'confidential';
      END IF;
    END $$
  `.execute(db)
  await sql`ALTER TABLE "OAuthAPIProvider" ALTER COLUMN "clientSecret" DROP NOT NULL`.execute(db)

  // 6. Add PKCE columns to OAuthAPICode
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'OAuthAPICode' AND column_name = 'codeChallenge'
      ) THEN
        ALTER TABLE "OAuthAPICode" ADD COLUMN "codeChallenge" varchar(128);
        ALTER TABLE "OAuthAPICode" ADD COLUMN "codeChallengeMethod" varchar(10);
      END IF;
    END $$
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  // Reverse PKCE and clientType changes
  await sql`ALTER TABLE "OAuthAPICode" DROP COLUMN IF EXISTS "codeChallengeMethod"`.execute(db)
  await sql`ALTER TABLE "OAuthAPICode" DROP COLUMN IF EXISTS "codeChallenge"`.execute(db)
  await sql`UPDATE "OAuthAPIProvider" SET "clientSecret" = '' WHERE "clientSecret" IS NULL`.execute(
    db
  )
  await sql`ALTER TABLE "OAuthAPIProvider" ALTER COLUMN "clientSecret" SET NOT NULL`.execute(db)
  await sql`ALTER TABLE "OAuthAPIProvider" DROP COLUMN IF EXISTS "clientType"`.execute(db)
  await sql`DROP TYPE IF EXISTS "OAuthClientTypeEnum"`.execute(db)

  // Reverse scope enum changes
  await db.schema
    .createType('OAuthScopeEnumOld')
    .asEnum(['graphql:query', 'graphql:mutation'])
    .execute()

  // :read scopes → graphql:query; :write scopes → graphql:mutation
  await sql`ALTER TABLE "OAuthAPIProvider" ADD COLUMN "scopesOld" "OAuthScopeEnumOld"[]`.execute(db)
  await sql`
    UPDATE "OAuthAPIProvider" SET "scopesOld" = (
      SELECT array_agg(DISTINCT old_scope ORDER BY old_scope)::"OAuthScopeEnumOld"[]
      FROM (
        SELECT
          CASE WHEN v LIKE '%:read' THEN 'graphql:query'
               ELSE 'graphql:mutation'
          END AS old_scope
        FROM unnest("scopes"::text[]) AS v
      ) subq
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
        SELECT array_agg(DISTINCT old_scope ORDER BY old_scope)::"OAuthScopeEnumOld"[]
        FROM (
          SELECT
            CASE WHEN v LIKE '%:read' THEN 'graphql:query'
                 ELSE 'graphql:mutation'
            END AS old_scope
          FROM unnest("scopes"::text[]) AS v
        ) subq
      )
    `.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" DROP COLUMN "scopes"`.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" RENAME COLUMN "scopesOld" TO "scopes"`.execute(db)
    await sql`ALTER TABLE "OAuthAPICode" ALTER COLUMN "scopes" SET NOT NULL`.execute(db)
  }

  await sql`DROP TYPE IF EXISTS "OAuthScopeEnum"`.execute(db)
  await sql`ALTER TYPE "OAuthScopeEnumOld" RENAME TO "OAuthScopeEnum"`.execute(db)
}
