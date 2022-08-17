import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "MeetingSeries"
      ADD COLUMN IF NOT EXISTS "teamId" VARCHAR(100) NOT NULL,
      ADD COLUMN IF NOT EXISTS "facilitatorId" VARCHAR(100) NOT NULL;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "MeetingSeries"
      DROP COLUMN IF EXISTS "teamId",
      DROP COLUMN IF EXISTS "facilitatorId";
  `)
  await client.end()
}
