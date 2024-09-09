import {Kysely, PostgresDialect, sql} from 'kysely'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  const teamsWithout1Leader = await pg
    .selectFrom('TeamMember')
    .select('teamId')
    .select(({fn}) => fn.count('id').as('count'))
    .where('isNotRemoved', '=', true)
    .groupBy('teamId')
    .having(sql<boolean>`SUM(CASE WHEN "isLead" = true THEN 1 ELSE 0 END) != 1`)
    .execute()

  await Promise.all(
    teamsWithout1Leader.map(async (row) => {
      const {teamId} = row
      // remove all leads for the cases where we had more than 1
      await pg.updateTable('TeamMember').set({isLead: false}).where('teamId', '=', teamId).execute()
      await pg
        .with('NextLead', (qb) =>
          qb
            .selectFrom('TeamMember')
            .select('id')
            .where('teamId', '=', teamId)
            .where('isNotRemoved', '=', true)
            .orderBy('createdAt', 'asc')
            .limit(1)
        )
        .updateTable('TeamMember')
        .set({isLead: true})
        .where(({eb, selectFrom}) => eb('id', '=', selectFrom('NextLead').select('id')))
        .returning('id')
        .execute()
    })
  )
}

export async function down() {
  // noop
}
