import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // whether the author chose to be anonymous used to be implied by commentParaphrased holding a
  // copy of a signed comment, which made a rewrite that happened to match the original look
  // signed. Record the choice outright so commentParaphrased only ever holds a rewrite
  await db.schema
    .alterTable('TeamHealthResponse')
    .addColumn('isAnonymous', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()
  await db
    .updateTable('TeamHealthResponse')
    .set({isAnonymous: true})
    .where('comment', 'is not', null)
    .where((eb) =>
      eb.or([
        eb('commentParaphrased', 'is', null),
        eb('commentParaphrased', '!=', eb.ref('comment'))
      ])
    )
    .execute()
  await db
    .updateTable('TeamHealthResponse')
    .set({commentParaphrased: null})
    .where('isAnonymous', '=', false)
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('TeamHealthResponse')
    .set((eb) => ({commentParaphrased: eb.ref('comment')}))
    .where('isAnonymous', '=', false)
    .where('comment', 'is not', null)
    .execute()
  await db.schema.alterTable('TeamHealthResponse').dropColumn('isAnonymous').execute()
}
