import {type Kysely, sql} from 'kysely'

// jira/github predate the V2 migration ledger in production (added directly to
// IntegrationProviderServiceEnum before this table existed), so the committed init
// snapshot never adds them. A fresh DB built from the ledger alone needs them added
// explicitly, and this has to be its own migration: pg forbids *using* a value in the
// same transaction that added it, and each migration commits on its own (see
// transactionMode in .config/kyselyMigrations.ts). This must run before
// unifyJiraGitHubAuth, hence the timestamp just before it.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" ADD VALUE IF NOT EXISTS 'jira'`.execute(
    db
  )
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" ADD VALUE IF NOT EXISTS 'github'`.execute(
    db
  )
}

// no-op: postgres can't drop a single enum value without rebuilding the type, and
// jira/github predate the ledger in production, so removing them here would be
// destructive without actually reverting anything upstream of this migration.
export async function down(_db: Kysely<any>): Promise<void> {}
