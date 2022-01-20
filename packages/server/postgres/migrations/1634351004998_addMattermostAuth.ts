import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
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
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DROP TABLE IF EXISTS "MattermostAuth";`)
  await client.end()
}
