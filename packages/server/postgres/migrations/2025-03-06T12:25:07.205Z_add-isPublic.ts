import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Team')
    .addColumn('isPublic', 'boolean', (col) => col.defaultTo(false).notNull())
    .execute()

  const featureFlags = db
    .selectFrom('FeatureFlag')
    .innerJoin('FeatureFlagOwner', 'FeatureFlag.id', 'FeatureFlagOwner.featureFlagId')
    .where('FeatureFlag.featureName', '=', 'publicTeams')
    .select('FeatureFlagOwner.orgId')

  await db.updateTable('Team').set({isPublic: true}).where('orgId', 'in', featureFlags).execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Team').dropColumn('isPublic').execute()
}
