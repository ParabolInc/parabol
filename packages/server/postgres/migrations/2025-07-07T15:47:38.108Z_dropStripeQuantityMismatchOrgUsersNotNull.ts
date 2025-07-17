import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('StripeQuantityMismatchLogging')
    .alterColumn('orgUsers', (ac) => ac.dropNotNull())
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('StripeQuantityMismatchLogging')
    .set({
      orgUsers: '{}'
    })
    .where('orgUsers', 'is', null)
    .execute()
  await db.schema
    .alterTable('StripeQuantityMismatchLogging')
    .alterColumn('orgUsers', (ac) => ac.setNotNull())
    .execute()
}
