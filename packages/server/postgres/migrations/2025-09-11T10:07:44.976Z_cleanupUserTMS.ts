import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  const res = await db
    .with('truth', (qc) =>
      qc
        .selectFrom('TeamMember as tm')
        .innerJoin('Team as t', 'tm.teamId', 't.id')
        .innerJoin('User as u', 'tm.userId', 'u.id')
        .select((eb) => ['u.id', eb.fn.agg('array_agg', 'tm.teamId').as('truth'), 'u.tms'])
        .where('t.isArchived', '=', false)
        .where('tm.isNotRemoved', '=', true)
        .groupBy('u.id')
        .having(({eb, fn}) =>
          eb.not(
            eb.and([
              eb('u.tms', '@>', fn.agg('array_agg', 'tm.teamId')),
              eb('u.tms', '<@', fn.agg('array_agg', 'tm.teamId'))
            ])
          )
        )
    )
    .updateTable('User')
    .set((eb) => ({
      tms: eb.selectFrom('truth').select('truth').where('User.id', '=', eb.ref('truth.id'))
    }))
    .where((eb) => eb('User.id', 'in', eb.selectFrom('truth').select('id')))
    .executeTakeFirstOrThrow()
  console.log(`Cleaned User.tms array of ${res.numUpdatedRows} users`)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {}
