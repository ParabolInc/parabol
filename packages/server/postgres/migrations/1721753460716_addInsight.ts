import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    CREATE TABLE "Insight" (
      "id" SERIAL PRIMARY KEY,
      "teamId" VARCHAR(100) NOT NULL,
      "startDateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
      "endDateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
      "wins" TEXT[],
      "challenges" TEXT[],
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "idx_teamId" ON "Insight" ("teamId");
    CREATE INDEX IF NOT EXISTS "idx_startDateTime" ON "Insight" ("startDateTime");
    CREATE INDEX IF NOT EXISTS "idx_endDateTime" ON "Insight" ("endDateTime");
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "Insight";
  `)
  await client.end()
}
