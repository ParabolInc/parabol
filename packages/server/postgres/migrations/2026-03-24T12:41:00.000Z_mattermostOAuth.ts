import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Allow system-level OAuth providers with no org (e.g. the Mattermost plugin)
  await db.schema.alterTable('OAuthAPIProvider').alterColumn('orgId', (col) => col.dropNotNull()).execute()

  // Add persisted-only scope: restricts tokens to precompiled relay queries only
  await sql`ALTER TYPE "OAuthScopeEnum" ADD VALUE IF NOT EXISTS 'graphql:persisted'`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  // Note: removing a Postgres enum value requires a full type recreate.
  // Restore orgId NOT NULL (only safe if no null rows remain).
  await db.schema
    .alterTable('OAuthAPIProvider')
    .alterColumn('orgId', (col) => col.setNotNull())
    .execute()
}
