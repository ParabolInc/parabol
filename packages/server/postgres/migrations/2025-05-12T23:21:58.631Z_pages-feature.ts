import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('FeatureFlag')
    .values({
      featureName: 'Pages',
      description: 'Block editors scoped to the user with RBAC sharing',
      expiresAt: new Date('2025-09-01'),
      scope: 'User'
    })
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('FeatureFlag').where('featureName', '=', 'Pages').execute()
}
