import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import {backupTeamQuery, backupUserQuery} from '../generatedMigrationHelpers'
import getPgConfig from '../getPgConfig'

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
}

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await connectRethinkDB()
  const pgGhostTeam = await client.query(`SELECT 1 FROM "Team" WHERE id = 'aGhostTeam';`)
  if (pgGhostTeam.rowCount === 0 && (await r.tableList().contains('Team').run())) {
    const ghostTeam = await r.table('Team').get('aGhostTeam').run()
    const fixedGhostTeam = {
      ...ghostTeam,
      lastMeetingType: 'retrospective',
      updatedAt: new Date(),
      jiraDimensionFields: []
    }
    await backupTeamQuery.run({teams: [fixedGhostTeam]}, client)
  }

  const pgGhostUser = await client.query(`SELECT 1 FROM "User" WHERE id = 'aGhostUser';`)
  if (pgGhostUser.rowCount === 0) {
    // go from scratch here because it might not always exist in rethinkdb due to now-fixed backupOrganization error
    const birth = new Date('Wed Jun 01 2016 00:00:00 GMT+00:00')
    const aGhostUser = {
      id: 'aGhostUser',
      lastSeenAt: birth,
      lastSeenAtURLs: [],
      preferredName: 'A Ghost',
      connectedSockets: [],
      email: 'love@parabol.co',
      picture:
        'https://action-files.parabol.co/production/build/v5.10.1/42342faa774f05b7626fa91ff8374e59.svg',
      createdAt: birth,
      tier: 'enterprise',
      tms: ['aGhostTeam'],
      updatedAt: birth,
      inactive: false,
      featureFlags: [],
      identities: [],
      isRemoved: false,
      payLaterClickCount: 0
    } as any
    await backupUserQuery.run({users: [aGhostUser]}, client)
  }
  await client.end()
  await r.getPoolMaster().drain()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DELETE FROM "Team" WHERE id = 'aGhostTeam';`)
  await client.query(`DELETE FROM "User" WHERE id = 'aGhostUser';`)
  await client.end()
}
