import {Client} from 'pg'
import getPgConfig from '../../postgres/getPgConfig'
import {Team} from '../../postgres/queries/getTeamsByIds'
import checkTeamEq from '../../postgres/utils/checkTeamEq'
import {dropUndefined} from '../../postgres/utils/dropUndefined'

export const up = async function (r) {
  const client = new Client(getPgConfig())
  await client.connect()
  const teamTableExists = await client.query<{exists: boolean}>(`SELECT EXISTS (SELECT 1 FROM "pg_tables" WHERE tablename = 'Team');`)

  // table does not exist on fresh DBs
  if (teamTableExists.rows[0].exists) {
    const errors = await checkTeamEq()
    if (errors.foundErrors > 1) {
      throw new Error(JSON.stringify(errors, undefined, ' '))
    }
  }

  await r.tableDrop('Team').run()
};

export const down = async function (r) {
  if (await r.tableList().contains('Team').run()) return
  await r
    .tableCreate('Team')
    .run()
  await r
    .table('Team')
    .indexCreate('orgId')
    .run()
  await r
    .table('Team')
    .indexCreate('updatedAt')
    .run()
  await r
    .table('Team')
    .indexWait()
    .run()

  const client = new Client(getPgConfig())
  await client.connect()
  const teams = await client.query<Team>(`SELECT * FROM "Team";`)

  const batchSize = 1000

  for (let current = 0; current * batchSize < teams.rowCount; current+= batchSize) {
    const filteredTeams = teams.rows.slice(current, current + batchSize).map(dropUndefined)
    await r.table('Team').insert(filteredTeams).run()
  }
};
