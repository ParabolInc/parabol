import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
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
  await db.schema.createType('OAuthScopeEnumV2').asEnum(ALL_SCOPES).execute()
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

  await db.schema
    .createTable('PersonalAccessToken')
    .addColumn('id', 'bigserial', (col) => col.primaryKey())
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('label', 'varchar(255)', (col) => col.notNull())
    .addColumn('prefix', 'varchar(8)', (col) => col.notNull().unique())
    .addColumn('hashedToken', 'varchar(60)', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('scopes', sql`"OAuthScopeEnum"[]`, (col) => col.notNull())
    .addColumn('grantedOrgIds', sql`text[]`)
    .addColumn('grantedTeamIds', sql`text[]`)
    .addColumn('grantedPageIds', sql`text[]`)
    .addColumn('lastUsedAt', 'timestamptz')
    .addColumn('expiresAt', 'timestamptz')
    .addColumn('revokedAt', 'timestamptz')
    .execute()

  await Promise.all([
    db.schema
      .createIndex('idx_PersonalAccessToken_userId')
      .on('PersonalAccessToken')
      .column('userId')
      .execute(),
    // partial index: only active tokens are looked up by prefix
    db.schema
      .createIndex('idx_PersonalAccessToken_prefix_active')
      .on('PersonalAccessToken')
      .column('prefix')
      .where(sql<boolean>`"revokedAt" IS NULL`)
      .execute()
  ])
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('PersonalAccessToken').execute()
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
