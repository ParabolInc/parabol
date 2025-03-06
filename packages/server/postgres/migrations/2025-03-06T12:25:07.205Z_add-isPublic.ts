import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Team')
    .addColumn('isPublic', 'boolean', (col) => col.defaultTo(false).notNull())
    .execute()

  const featureFlags = await db
    .selectFrom('FeatureFlag')
    .innerJoin('FeatureFlagOwner', 'FeatureFlag.id', 'FeatureFlagOwner.featureFlagId')
    .where('FeatureFlag.featureName', '=', 'publicTeams')
    .select('FeatureFlagOwner.orgId')
    .execute()

  const orgIds = featureFlags.map((flag) => flag.orgId)
  if (orgIds.length > 0) {
    await db.updateTable('Team').set({isPublic: true}).where('orgId', 'in', orgIds).execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('Team').dropColumn('isPublic').execute()
}
