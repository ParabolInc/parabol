import {Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Organization')
    .addColumn('useAI', 'boolean', (col) => col.notNull().defaultTo(true))
    .execute()

  await db
    .updateTable('Organization')
    .set({useAI: false})
    .where(
      'id',
      'in',
      db
        .selectFrom('FeatureFlagOwner')
        .innerJoin('FeatureFlag', 'FeatureFlag.id', 'FeatureFlagOwner.featureFlagId')
        .where('FeatureFlag.featureName', '=', 'noAISummary')
        .select('FeatureFlagOwner.orgId')
    )
    .execute()

  await db
    .deleteFrom('FeatureFlagOwner')
    .where(
      'featureFlagId',
      'in',
      db.selectFrom('FeatureFlag').select('id').where('featureName', '=', 'noAISummary')
    )
    .execute()

  await db.deleteFrom('FeatureFlag').where('featureName', '=', 'noAISummary').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  const [flagId] = await db
    .insertInto('FeatureFlag')
    .values({
      featureName: 'noAISummary',
      description: 'Disable AI features for this organization',
      expiresAt: new Date('2074-01-31T00:00:00.000Z'),
      scope: 'Organization'
    })
    .returning('id')
    .execute()

  await db
    .insertInto('FeatureFlagOwner')
    .columns(['featureFlagId', 'orgId'])
    .expression(
      db
        .selectFrom('Organization')
        .select([sql`${flagId.id}::uuid`.as('featureFlagId'), 'id as orgId'])
        .where('useAI', '=', false)
    )
    .execute()

  await db.schema.alterTable('Organization').dropColumn('useAI').execute()
}
