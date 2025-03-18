import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('FeatureFlag').where('featureName', '=', 'publicTeams').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('FeatureFlag')
    .values({
      featureName: 'publicTeams',
      scope: 'Organization',
      expiresAt: '2025-03-31T00:00:00.000Z'
    })
    .execute()
}
