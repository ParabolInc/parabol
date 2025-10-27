import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('FeatureFlag').where('featureName', '=', 'Pages').execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(_db: Kysely<any>): Promise<void> {
  // no down, feature is available for everyone
}
