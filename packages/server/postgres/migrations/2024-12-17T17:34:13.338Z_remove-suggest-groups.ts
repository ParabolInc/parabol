import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('FeatureFlag').where('featureName', '=', 'suggestGroups').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('FeatureFlag')
    .values({
      featureName: 'suggestGroups',
      description: 'Auto-group reflections using AI',
      expiresAt: new Date('2025-01-31T00:00:00.000Z'),
      scope: 'Organization'
    })
    .execute()
}
