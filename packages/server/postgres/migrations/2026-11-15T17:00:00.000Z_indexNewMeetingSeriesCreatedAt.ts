import {type Kysely, sql} from 'kysely'
import type {MigrationConfig} from 'kysely/migration'

// CREATE INDEX CONCURRENTLY keeps NewMeeting writable while the index builds, and pg forbids it in a transaction.
// A build that fails leaves an invalid index behind, so it is dropped first and the migration can run again
export const config: MigrationConfig = {transaction: false}

const createIndexConcurrently = async (db: Kysely<any>, name: string, columns: string[]) => {
  await sql`DROP INDEX CONCURRENTLY IF EXISTS ${sql.id(name)}`.execute(db)
  await sql`CREATE INDEX CONCURRENTLY ${sql.id(name)} ON "NewMeeting" (${sql.join(columns.map((column) => sql.id(column)))}) WHERE "meetingSeriesId" IS NOT NULL`.execute(
    db
  )
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await createIndexConcurrently(db, 'idx_NewMeeting_meetingSeriesId_createdAt', [
    'meetingSeriesId',
    'createdAt'
  ])
  // the new index leads with meetingSeriesId, so it serves every lookup the old one did
  await sql`DROP INDEX CONCURRENTLY IF EXISTS "idx_NewMeeting_meetingSeriesId"`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await createIndexConcurrently(db, 'idx_NewMeeting_meetingSeriesId', ['meetingSeriesId'])
  await sql`DROP INDEX CONCURRENTLY IF EXISTS "idx_NewMeeting_meetingSeriesId_createdAt"`.execute(
    db
  )
}
