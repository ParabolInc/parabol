import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "Team"
  ADD COLUMN IF NOT EXISTS "qualAIMeetingsCount" INT NOT NULL DEFAULT 0;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "qualAIMeetingsCount"
  DROP COLUMN IF EXISTS "summary";
  `)
  await client.end()
}
