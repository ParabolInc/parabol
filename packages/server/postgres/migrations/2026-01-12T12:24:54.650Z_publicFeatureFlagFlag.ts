import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  db.schema
    .alterTable('FeatureFlag')
    .addColumn('isPublic', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()
  db.updateTable('FeatureFlag')
    .set({isPublic: true})
    .where('featureName', '=', 'Databases')
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  db.schema.alterTable('FeatureFlag').dropColumn('isPublic').execute()
}
