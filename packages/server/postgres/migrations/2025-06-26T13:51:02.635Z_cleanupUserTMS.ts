import type {Kysely} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // clean our own backyard first
  const teamId = 'aGhostTeam'
  const userId = 'aGhostUser'
  await db
    .insertInto('TeamMember')
    .values({
      id: `${userId}::${teamId}`,
      teamId,
      userId
    })
    .onConflict((oc) => oc.doNothing())
    .execute()

  //with truth as (select u.id, array_agg(tm."teamId") as truth, tms from "TeamMember" tm join "Team" t on tm."teamId" = t.id join "User" u on tm."userId" = u.id where t."isArchived" = false and tm."isNotRemoved" = true group by u.id having not (tms @> array_agg(tm."teamId") and tms <@ array_agg(tm."teamId")))
  //select * from "User" where id in (select id from truth)
  await db
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
            eb.and(
              eb('u.tms', '@>', fn.agg('array_agg', 'tm.teamId')),
              eb('u.tms', '<@', fn.agg('array_agg', 'tm.teamId'))
            )
          )
        )
    )
    .updateTable('User')
    .set((eb) => ({
      tms: eb.ref('truth.truth')
    }))
    .from('truth')
    .where((eb) => eb('User.id', '=', eb.ref('truth.id')))
    .where((eb) => eb('User.id', 'in', eb.selectFrom('truth').select('id')))
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {}
