import {Client} from 'pg'
import getPgConfig from '../getPgConfig'
import {r} from 'rethinkdb-ts'
import insertIntegrationProviderWithToken from '../queries/insertIntegrationProviderWithToken'
import {nestIntegrationProviderOnIntegrationToken} from '../types/IntegrationTokenWithProvider'

interface MattermostAuth {
  createdAt: Date
  updatedAt: Date
  isActive: true
  webhookUrl: string
  userId: string
  teamId: string
}

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL)
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

  const mattermostAuths: MattermostAuth[] = (
    await client.query(`SELECT * FROM "MattermostAuth" WHERE "isActive" = TRUE;`)
  ).rows

  const teamOrgIdRows = await r
    .table('Team')
    .getAll(r.args(mattermostAuths.map(({teamId}) => teamId)), {index: 'id'})
    .pluck('id', 'orgId')
    .merge((row) => ({teamId: row('id')}))
    .without('id')
    .run()

  const orgIdsByTeamId = teamOrgIdRows.reduce((acc, {teamId, orgId}) => {
    acc[teamId] = orgId
    return acc
  }, {} as {[teamId: string]: string})

  const mattermostAuthsToInsert = mattermostAuths.map((mattermostAuth) => {
    return insertIntegrationProviderWithToken({
      provider: {
        type: 'mattermost',
        tokenType: 'webhook',
        scope: 'team',
        name: 'mattermost',
        providerMetadata: {
          webhookUrl: mattermostAuth.webhookUrl
        },
        orgId: orgIdsByTeamId[mattermostAuth.teamId],
        teamId: mattermostAuth.teamId
      },
      userId: mattermostAuth.userId,
      tokenMetadata: {}
    })
  })
  await Promise.all(mattermostAuthsToInsert)
  await client.query(`DROP TABLE "MattermostAuth";`)

  await client.end()
  await r.getPoolMaster().drain()
}

export async function down() {
  await connectRethinkDB()
  const client = new Client(getPgConfig())
  await client.connect()

  const mattermostTokensWithProvider = (
    await client.query(`
    SELECT
      "IntegrationToken".*,
      "IntegrationProvider"."id" AS "IntegrationProvider_id",
      "IntegrationProvider"."type" AS "IntegrationProvider_type",
      "IntegrationProvider"."scope" AS "IntegrationProvider_scope",
      "IntegrationProvider"."orgId" AS "IntegrationProvider_orgId",
      "IntegrationProvider"."teamId" AS "IntegrationProvider_teamId",
      "IntegrationProvider"."isActive" AS "IntegrationProvider_isActive",
      "IntegrationProvider"."name" AS "IntegrationProvider_name",
      "IntegrationProvider"."serverBaseUri" AS "IntegrationProvider_serverBaseUri",
      "IntegrationProvider"."oauthScopes" AS "IntegrationProvider_oauthScopes",
      "IntegrationProvider"."oauthClientId" AS "IntegrationProvider_oauthClientId",
      "IntegrationProvider"."createdAt" AS "IntegrationProvider_createdAt",
      "IntegrationProvider"."updatedAt" AS "IntegrationProvider_updatedAt"
    FROM "IntegrationToken"
    JOIN "IntegrationProvider"
    ON ("IntegrationToken"."providerId" = "IntegrationProvider"."id")
    WHERE (
      "IntegrationProvider"."type" = 'mattermost'
      AND "IntegrationToken"."isActive" = TRUE
      AND "IntegrationProvider"."isActive" = TRUE
    );
  `)
  ).rows.map((row) => nestIntegrationProviderOnIntegrationToken(row))

  await client.query(`
    CREATE TABLE IF NOT EXISTS "MattermostAuth" (
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
      "webhookUrl" VARCHAR(2083) NOT NULL,
      "userId" VARCHAR(100) NOT NULL,
      "teamId" VARCHAR(100) NOT NULL,
      PRIMARY KEY ("userId", "teamId")
    );
    CREATE INDEX IF NOT EXISTS "idx_MattermostAuth_teamId" ON "MattermostAuth"("teamId");
  `)

  if (mattermostTokensWithProvider.length > 0) {
    const mattermostAuthsToInsert = mattermostTokensWithProvider.map(
      (mattermostTokenWithProvider) =>
        client.query(
          `
        INSERT INTO "MattermostAuth" ("createdAt", "updatedAt", "isActive", "webhookUrl", "userId", "teamId")
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
          [
            mattermostTokenWithProvider.createdAt,
            mattermostTokenWithProvider.updatedAt,
            mattermostTokenWithProvider.isActive,
            (mattermostTokenWithProvider.provider.providerMetadata as any).webhookUrl,
            mattermostTokenWithProvider.userId,
            mattermostTokenWithProvider.teamId
          ]
        )
    )
    await Promise.all(mattermostAuthsToInsert)
    await client.query(
      `
      DELETE FROM "IntegrationProvider" WHERE "id" = ANY($1::int[]);
    `,
      [mattermostTokensWithProvider.map((row) => row.provider.id)]
    )
  }
  await client.end()
  await r.getPoolMaster().drain()
}
