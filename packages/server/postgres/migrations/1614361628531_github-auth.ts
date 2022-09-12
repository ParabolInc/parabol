import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import {Client} from 'pg'
import {r, RValue} from 'rethinkdb-ts'
import {parse} from 'url'
import {insertGitHubAuthsQuery} from '../generatedMigrationHelpers'
import getPgConfig from '../getPgConfig'
export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(): Promise<void> {
  const {hostname: host, port, path} = parse(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host: host!,
    port: parseInt(port!, 10),
    db: path!.split('/')[1]
  })
  const client = new Client(getPgConfig())
  await client.connect()
  const ghIntegrations = await r
    .table('Provider')
    .filter({service: 'GitHubIntegration', isActive: true})
    .filter((row: RValue) => row('accessToken').default(null).ne(null))
    .run()
  const auths = ghIntegrations.map(
    ({accessToken, createdAt, isActive, providerUserName, teamId, updatedAt, userId}) => ({
      accessToken,
      createdAt,
      updatedAt,
      isActive,
      login: providerUserName,
      teamId,
      userId
    })
  )
  await client.query(`
    CREATE TABLE IF NOT EXISTS "GitHubAuth" (
      "accessToken" VARCHAR(40) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
      "login" VARCHAR(200) NOT NULL,
      "teamId" VARCHAR(100) NOT NULL,
      "userId" VARCHAR(100) NOT NULL,
      PRIMARY KEY ("userId", "teamId")
    );
  `)
  if (auths.length) {
    await insertGitHubAuthsQuery.run({auths}, client)
  }
  await client.end()
  await r.getPoolMaster()?.drain()
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`DROP TABLE "GitHubAuth";`)
}
