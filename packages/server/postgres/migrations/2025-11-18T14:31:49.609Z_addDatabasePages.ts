import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('Page')
    .addColumn('isDatabase', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await db
    .insertInto('FeatureFlag')
    .values({
      featureName: 'Databases',
      description: 'Experimental databases in pages',
      expiresAt: new Date('2026-03-01'),
      scope: 'Organization'
    })
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('Page').where('isDatabase', '=', true).execute()
  await db.schema.alterTable('Page').dropColumn('isDatabase').execute()

  await db
    .deleteFrom('FeatureFlag')
    .where('featureName', '=', 'Databases')
    .where('scope', '=', 'Organization')
    .execute()
}
