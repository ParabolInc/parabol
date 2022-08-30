import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import getPgConfig from '../getPgConfig'

interface MattermostAuth {
  createdAt: Date
  updatedAt: Date
  isActive: true
  webhookUrl: string
  userId: string
  teamId: string
}

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
}

export async function up() {
  await connectRethinkDB()
  const client = new Client(getPgConfig())
  await client.connect()

  const mattermostAuthResults = await client.query<MattermostAuth>(
    `SELECT * FROM "MattermostAuth" WHERE "isActive" = TRUE;`
  )
  const mattermostAuths = mattermostAuthResults.rows

  const mattermostAuthsToInsert = mattermostAuths.map(async (mattermostAuth) => {
    const {teamId, userId, webhookUrl} = mattermostAuth
    const result = await client.query<{id: number}>(
      `
      INSERT INTO
        "IntegrationProvider" (
          "service",
          "authStrategy",
          "scope",
          "webhookUrl",
          "teamId"
        )
      VALUES($1, $2, $3, $4, $5)
      RETURNING id;`,
      ['mattermost', 'webhook', 'team', webhookUrl, teamId]
    )
    const providerId = result.rows[0].id
    await client.query(
      `
      INSERT INTO
        "TeamMemberIntegrationAuth" (
          "providerId",
          "teamId",
          "userId",
          "service"
        )
      VALUES($1, $2, $3, $4)
    `,
      [providerId, teamId, userId, 'mattermost']
    )
  })
  await Promise.all(mattermostAuthsToInsert)
  await client.end()
  await r.getPoolMaster()?.drain()
}

export async function down() {
  // This down function was broken
  // To save time, I removed dropping MattermostAuth table from the up migration
  // We can drop that table in a later migration
}
