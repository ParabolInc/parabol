import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "Team"
    DROP COLUMN IF EXISTS "isOneOnOneTeam";
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "Team"
    ADD COLUMN IF NOT EXISTS "isOneOnOneTeam" BOOLEAN NOT NULL DEFAULT FALSE;
  `)
  await client.end()
}
