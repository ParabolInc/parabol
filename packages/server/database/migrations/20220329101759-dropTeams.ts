import getPg, {closePg} from '../../postgres/getPg'
import {Team} from '../../postgres/queries/getTeamsByIds'
import {closeRethink} from '../rethinkDriver'

export const up = async function (r) {
  const pg = await getPg()

  const teamTableExists = await pg.query<{exists: boolean}>(
    `SELECT EXISTS (SELECT 1 FROM "pg_tables" WHERE tablename = 'Team');`
  )

  await r.tableDrop('Team').run()

  await Promise.all([closePg(), closeRethink()])
}

export const down = async function (r) {
  if (await r.tableList().contains('Team').run()) return
  await r.tableCreate('Team').run()
  await r.table('Team').indexCreate('orgId').run()
  await r.table('Team').indexCreate('updatedAt').run()
  await r.table('Team').indexWait().run()

  const pg = await getPg()
  const teams = await pg.query<Team>(`SELECT * FROM "Team";`)

  const batchSize = 1000

  function dropUndefined(object: any) {
    Object.keys(object).forEach((key) => {
      if (object[key] === undefined) {
        delete object[key]
      }
    })
  }

  for (let current = 0; current * batchSize < teams.rowCount; current += batchSize) {
    const filteredTeams = teams.rows.slice(current, current + batchSize).map(dropUndefined)
    await r.table('Team').insert(filteredTeams).run()
  }

  await closePg()
}
