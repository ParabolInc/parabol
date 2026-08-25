import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // AtlassianAuth already holds tokens up to 8192 (2025-08-19T13:30:51.353Z_maxOAuthTokenSize.ts)
  // and granular scopes up to 1000 chars; match both widths so the backfill below can't overflow.
  await sql`ALTER TABLE "TeamMemberIntegrationAuth" ALTER COLUMN "accessToken" TYPE varchar(8192)`.execute(
    db
  )
  await sql`ALTER TABLE "TeamMemberIntegrationAuth" ALTER COLUMN "refreshToken" TYPE varchar(8192)`.execute(
    db
  )
  await sql`ALTER TABLE "TeamMemberIntegrationAuth" ALTER COLUMN "scopes" TYPE varchar(1000)`.execute(
    db
  )
  // service-specific bolt-ons that have no column of their own, e.g. jira: {cloudIds: string[]}
  await sql`ALTER TABLE "TeamMemberIntegrationAuth" ADD COLUMN IF NOT EXISTS "meta" jsonb`.execute(
    db
  )
  // Atlassian rotates refresh tokens, so every row for the same account must be refreshed
  // together; this index serves that lookup
  await db.schema
    .createIndex('idx_TeamMemberIntegrationAuth_service_providerUserId')
    .ifNotExists()
    .on('TeamMemberIntegrationAuth')
    .columns(['service', 'providerUserId'])
    .where(sql.ref('providerUserId'), 'is not', null)
    .execute()

  // Credentials are deliberately not read from env here: the global providers are
  // created inactive & without secrets so the backfill has stable ids to point at, and
  // primeIntegrations (predeploy in prod, every Socket Server boot in dev) upserts the
  // clientId/clientSecret from env onto these same rows & activates them. A PPMI without
  // Atlassian/GitHub creds keeps an inactive provider, which every loader filters out.
  const providerIds = {} as Record<'jira' | 'github', number>
  for (const [service, serverBaseUrl] of [
    ['jira', 'https://api.atlassian.com'],
    ['github', 'https://api.github.com']
  ] as const) {
    const {id} = await db
      .insertInto('IntegrationProvider')
      .values({service, authStrategy: 'oauth2', scope: 'global', serverBaseUrl, isActive: false})
      .onConflict((oc) =>
        oc
          .columns(['orgId', 'teamId', 'service', 'authStrategy'])
          .doUpdateSet({service: sql`excluded.service`})
      )
      .returning('id')
      .executeTakeFirstOrThrow()
    providerIds[service] = id
  }

  // Row-for-row: each legacy row is a distinct team grant, so no dedup.
  await sql`
    INSERT INTO "TeamMemberIntegrationAuth"
      ("teamId", "userId", "providerId", service, "accessToken", "refreshToken", scopes,
       "providerUserId", meta, "isActive", "createdAt", "updatedAt")
    SELECT a."teamId", a."userId", ${providerIds.jira}, 'jira', a."accessToken",
           a."refreshToken", a.scope, a."accountId",
           jsonb_build_object('cloudIds', to_jsonb(a."cloudIds")),
           a."isActive", a."createdAt", a."updatedAt"
    FROM "AtlassianAuth" a
    ON CONFLICT ("userId", "teamId", service) DO NOTHING
  `.execute(db)

  await sql`
    INSERT INTO "TeamMemberIntegrationAuth"
      ("teamId", "userId", "providerId", service, "accessToken", scopes, "providerUserId",
       "isActive", "createdAt", "updatedAt")
    SELECT g."teamId", g."userId", ${providerIds.github}, 'github', g."accessToken",
           g.scope, g.login, g."isActive", g."createdAt", g."updatedAt"
    FROM "GitHubAuth" g
    ON CONFLICT ("userId", "teamId", service) DO NOTHING
  `.execute(db)

  // Recent search queries move to the shared table, where `query` has one fixed shape per
  // service: jira/jiraServer {queryString, isJQL, projectKeyFilters}, github {queryString}.
  // `id`/`lastUsedAt` leave the JSON because the table has its own columns for them.
  await sql`
    INSERT INTO "IntegrationSearchQuery" ("userId", "teamId", service, "providerId", query, "lastUsedAt")
    SELECT a."userId", a."teamId", 'jira', ${providerIds.jira},
           jsonb_build_object(
             'queryString', coalesce(q.value->>'queryString', ''),
             'isJQL', coalesce((q.value->>'isJQL')::boolean, false),
             'projectKeyFilters', coalesce(q.value->'projectKeyFilters', '[]'::jsonb)
           ),
           (q.value->>'lastUsedAt')::timestamptz
    FROM "AtlassianAuth" a, LATERAL unnest(a."jiraSearchQueries") AS q(value)
    WHERE a."isActive" = true
      AND (q.value->>'lastUsedAt')::timestamptz > now() - interval '60 days'
    ON CONFLICT DO NOTHING
  `.execute(db)

  await sql`
    DELETE FROM "IntegrationSearchQuery"
    WHERE service = 'jiraServer'
      AND NOT (
        jsonb_typeof(query->'queryString') = 'string'
        AND jsonb_typeof(query->'isJQL') = 'boolean'
        AND jsonb_typeof(query->'projectKeyFilters') = 'array'
      )
  `.execute(db)

  await sql`
    INSERT INTO "IntegrationSearchQuery" ("userId", "teamId", service, "providerId", query, "lastUsedAt")
    SELECT g."userId", g."teamId", 'github', ${providerIds.github},
           q.value - 'id' - 'lastUsedAt', (q.value->>'lastUsedAt')::timestamptz
    FROM "GitHubAuth" g, LATERAL unnest(g."githubSearchQueries") AS q(value)
    WHERE g."isActive" = true
      AND (q.value->>'lastUsedAt')::timestamptz > now() - interval '60 days'
    ON CONFLICT DO NOTHING
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // AtlassianAuth / GitHubAuth are untouched by up(), so the backfilled rows are
  // disposable. Connections made AFTER this migration exist only here and are lost.
  await db.deleteFrom('IntegrationSearchQuery').where('service', 'in', ['jira', 'github']).execute()
  await db
    .deleteFrom('TeamMemberIntegrationAuth')
    .where('service', 'in', ['jira', 'github'])
    .execute()
  await db
    .deleteFrom('IntegrationProvider')
    .where('service', 'in', ['jira', 'github'])
    .where('scope', '=', 'global')
    .execute()
  await db.schema
    .dropIndex('idx_TeamMemberIntegrationAuth_service_providerUserId')
    .ifExists()
    .execute()
  await sql`ALTER TABLE "TeamMemberIntegrationAuth" DROP COLUMN IF EXISTS "meta"`.execute(db)
  // accessToken/refreshToken/scopes stay widened: other services' rows may already rely
  // on the larger width, so narrowing them back here would be unsafe and isn't required
  // to undo this migration
}
