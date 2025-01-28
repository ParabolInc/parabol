import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('FeatureFlag')
    .set({
      expiresAt: '2025-03-31T00:00:00.000Z'
    })
    .where('featureName', '=', 'publicTeams')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('FeatureFlag')
    .set({
      expiresAt: '2025-01-31T00:00:00.000Z'
    })
    .where('featureName', '=', 'publicTeams')
    .execute()
}
