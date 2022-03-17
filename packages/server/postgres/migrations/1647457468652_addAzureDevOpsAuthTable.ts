import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()

  await client.query(`
    CREATE TABLE IF NOT EXISTS "AzureDevOpsAuth" (
      "accessToken" VARCHAR(2600) NOT NULL,
      "refreshToken" VARCHAR(2600) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
      "azureDevOpsSearchQueries" JSONB[] NOT NULL DEFAULT '{}',
      "instanceIds" VARCHAR(120)[] NOT NULL DEFAULT '{}',
      "scope" VARCHAR(240) NOT NULL,
      "accountId" VARCHAR(120) NOT NULL,
      "teamId" VARCHAR(120) NOT NULL,
      "userId" VARCHAR(120) NOT NULL,
      PRIMARY KEY ("userId", "teamId")
    );
  `)

  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DROP TABLE "AzureDevOpsAuth";`)
  await client.end()
}
