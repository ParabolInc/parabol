import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('OrganizationUser').dropColumn('inactive').execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('OrganizationUser')
    .addColumn('inactive', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await db
    .updateTable('OrganizationUser')
    .set((eb) => ({
      inactive: eb
        .selectFrom('User')
        .select('inactive')
        .whereRef('User.id', '=', 'OrganizationUser.userId')
    }))
    .execute()
}
