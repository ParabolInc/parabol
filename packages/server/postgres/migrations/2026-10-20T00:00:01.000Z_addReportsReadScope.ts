import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE "OAuthScopeEnum" ADD VALUE IF NOT EXISTS 'reports:read'`.execute(db)
}

// postgres can't drop a single enum value without rebuilding the type, and tokens may already hold it
export async function down(_db: Kysely<any>): Promise<void> {}
