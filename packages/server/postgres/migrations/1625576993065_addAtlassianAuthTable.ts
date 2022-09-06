import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import AtlassianManager from 'parabol-client/utils/AtlassianManager'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import {RDatum} from '../../database/stricterR'
import {insertAtlassianAuthsQuery} from '../generatedMigrationHelpers'
import getPgConfig from '../getPgConfig'
export const shorthands: ColumnDefinitions | undefined = undefined

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
}

export async function up(): Promise<void> {
  await connectRethinkDB()
  const client = new Client(getPgConfig())
  await client.connect()

  await client.query(`
    CREATE TABLE IF NOT EXISTS "AtlassianAuth" (
      "accessToken" VARCHAR(2600) NOT NULL,
      "refreshToken" VARCHAR(2600) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
      "jiraSearchQueries" JSONB[] NOT NULL DEFAULT '{}',
      "cloudIds" VARCHAR(120)[] NOT NULL DEFAULT '{}',
      "scope" VARCHAR(240) NOT NULL,
      "accountId" VARCHAR(120) NOT NULL,
      "teamId" VARCHAR(120) NOT NULL,
      "userId" VARCHAR(120) NOT NULL,
      PRIMARY KEY ("userId", "teamId")
    );
  `)

  const atlassianIntegrations = await r
    .table('AtlassianAuth')
    .filter((row: RDatum) => row('accessToken').default(null).ne(null))
    .run()
  const auths = atlassianIntegrations.map(
    ({
      accessToken,
      refreshToken,
      createdAt,
      updatedAt,
      isActive,
      jiraSearchQueries,
      cloudIds,
      accountId,
      teamId,
      userId
    }) => ({
      accessToken,
      refreshToken,
      createdAt,
      updatedAt,
      isActive,
      accountId,
      teamId,
      userId,
      jiraSearchQueries: jiraSearchQueries || [],
      cloudIds,
      scope: AtlassianManager.SCOPE.join(' ')
    })
  )
  if (auths.length) {
    await insertAtlassianAuthsQuery.run({auths}, client)
  }
  await client.end()
  await r.getPoolMaster()?.drain()
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`DROP TABLE "AtlassianAuth";`)
}
