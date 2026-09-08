import {type Kysely, sql} from 'kysely'

// Team health stages now host a discussion thread, one per question. pg forbids *using* an enum
// value in the same transaction that added it and each migration commits on its own (see
// transactionMode in .config/kyselyMigrations.ts), so the value lands here and the backfill that
// writes rows with it runs in the next migration.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE public."DiscussionTopicTypeEnum" ADD VALUE IF NOT EXISTS 'teamHealthQuestion'`.execute(
    db
  )
}

// no-op: postgres can't drop a single enum value without rebuilding the type, and the rows that
// use it are removed by the down of the migration that created them
export async function down(_db: Kysely<any>): Promise<void> {}
