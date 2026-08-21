import {type Kysely, sql} from 'kysely'

// Global providers for the two legacy services. Seeded here (not only in primeIntegrations)
// because the backfill below needs their ids in the same migration, and primeIntegrations
// never runs in dev.
const GLOBAL_PROVIDERS = [
  {
    service: 'jira',
    serverBaseUrl: 'https://api.atlassian.com',
    clientId: process.env.ATLASSIAN_CLIENT_ID,
    clientSecret: process.env.ATLASSIAN_CLIENT_SECRET
  },
  {
    service: 'github',
    serverBaseUrl: 'https://api.github.com',
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  }
] as const

const globalProviderId = (service: 'jira' | 'github') =>
  sql`(SELECT id FROM "IntegrationProvider" WHERE service = ${service} AND scope = 'global' AND "authStrategy" = 'oauth2' AND "isActive" = true LIMIT 1)`

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

  for (const {service, serverBaseUrl, clientId, clientSecret} of GLOBAL_PROVIDERS) {
    if (!clientId || !clientSecret) continue
    await db
      .insertInto('IntegrationProvider')
      .values({
        service,
        authStrategy: 'oauth2',
        scope: 'global',
        serverBaseUrl,
        clientId,
        clientSecret
      })
      .onConflict((oc) =>
        oc.columns(['orgId', 'teamId', 'service', 'authStrategy']).doUpdateSet({
          serverBaseUrl,
          clientId,
          clientSecret,
          isActive: true
        })
      )
      .execute()
  }

  const LEGACY_TABLES = {
    jira: {
      legacyTable: 'AtlassianAuth',
      envVars: ['ATLASSIAN_CLIENT_ID', 'ATLASSIAN_CLIENT_SECRET']
    },
    github: {legacyTable: 'GitHubAuth', envVars: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET']}
  } as const

  for (const service of ['jira', 'github'] as const) {
    const {clientId, clientSecret} = GLOBAL_PROVIDERS.find((p) => p.service === service)!
    if (clientId && clientSecret) continue
    const {legacyTable, envVars} = LEGACY_TABLES[service]
    const {count} = await sql<{count: string}>`SELECT count(*) FROM ${sql.raw(`"${legacyTable}"`)}`
      .execute(db)
      .then((res) => res.rows[0]!)
    if (Number(count) > 0) {
      throw new Error(
        `unifyJiraGitHubAuth: ${count} row(s) in "${legacyTable}" but no ${service} global provider could be seeded — set ${envVars[0]}/${envVars[1]} before running this migration`
      )
    }
  }

  // Row-for-row: each legacy row is a distinct team grant (spec §4.11a), so no dedup.
  // A deployment without a jira/github provider (no creds) has no rows to carry over —
  // the subselect yields NULL and the NOT NULL providerId rejects nothing because the
  // WHERE clause filters those out.
  await sql`
    INSERT INTO "TeamMemberIntegrationAuth"
      ("teamId", "userId", "providerId", service, "accessToken", "refreshToken", scopes,
       "providerUserId", meta, "isActive", "createdAt", "updatedAt")
    SELECT a."teamId", a."userId", ${globalProviderId('jira')}, 'jira', a."accessToken",
           a."refreshToken", a.scope, a."accountId",
           jsonb_build_object('cloudIds', to_jsonb(a."cloudIds")),
           a."isActive", a."createdAt", a."updatedAt"
    FROM "AtlassianAuth" a
    WHERE ${globalProviderId('jira')} IS NOT NULL
    ON CONFLICT ("userId", "teamId", service) DO NOTHING
  `.execute(db)

  await sql`
    INSERT INTO "TeamMemberIntegrationAuth"
      ("teamId", "userId", "providerId", service, "accessToken", scopes, "providerUserId",
       "isActive", "createdAt", "updatedAt")
    SELECT g."teamId", g."userId", ${globalProviderId('github')}, 'github', g."accessToken",
           g.scope, g.login, g."isActive", g."createdAt", g."updatedAt"
    FROM "GitHubAuth" g
    WHERE ${globalProviderId('github')} IS NOT NULL
    ON CONFLICT ("userId", "teamId", service) DO NOTHING
  `.execute(db)

  // Recent search queries move to the shared table. `id`/`lastUsedAt` leave the JSON
  // because the table has its own columns for them; the remaining keys match what
  // JiraServerIntegration.searchQueries already reads ({queryString, isJQL, projectKeyFilters}).
  await sql`
    INSERT INTO "IntegrationSearchQuery" ("userId", "teamId", service, "providerId", query, "lastUsedAt")
    SELECT a."userId", a."teamId", 'jira', ${globalProviderId('jira')},
           q.value - 'id' - 'lastUsedAt', (q.value->>'lastUsedAt')::timestamptz
    FROM "AtlassianAuth" a, LATERAL unnest(a."jiraSearchQueries") AS q(value)
    WHERE a."isActive" = true
      AND ${globalProviderId('jira')} IS NOT NULL
      AND (q.value->>'lastUsedAt')::timestamptz > now() - interval '60 days'
    ON CONFLICT DO NOTHING
  `.execute(db)

  await sql`
    INSERT INTO "IntegrationSearchQuery" ("userId", "teamId", service, "providerId", query, "lastUsedAt")
    SELECT g."userId", g."teamId", 'github', ${globalProviderId('github')},
           q.value - 'id' - 'lastUsedAt', (q.value->>'lastUsedAt')::timestamptz
    FROM "GitHubAuth" g, LATERAL unnest(g."githubSearchQueries") AS q(value)
    WHERE g."isActive" = true
      AND ${globalProviderId('github')} IS NOT NULL
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
