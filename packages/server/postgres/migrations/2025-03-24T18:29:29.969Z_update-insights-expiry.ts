import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('FeatureFlag')
    .set({
      expiresAt: '2025-07-31T00:00:00.000Z'
    })
    .where('featureName', '=', 'insights')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('FeatureFlag')
    .set({
      expiresAt: '2025-03-31T00:00:00.000Z'
    })
    .where('featureName', '=', 'insights')
    .execute()
}
