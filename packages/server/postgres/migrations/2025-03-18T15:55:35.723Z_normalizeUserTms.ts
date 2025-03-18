import {sql, type Kysely} from 'kysely'

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('User').dropColumn('tms').execute()
}

// biome-ignore lint/suspicious/noExplicitAny: `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('User')
    .addColumn('tms', sql`character varying(100)[]`, (col) => col.defaultTo('{}').notNull())
    .execute()
  await db
    .updateTable('User')
    .set((eb) => ({
      tms: eb.fn.coalesce(
        eb
          .selectFrom('TeamMember')
          .select((se) => se.fn('array_agg', ['teamId']).as('tms'))
          .where('TeamMember.userId', '=', eb.ref('User.id')),
        eb.val('{}')
      )
    }))
    .execute()
}
