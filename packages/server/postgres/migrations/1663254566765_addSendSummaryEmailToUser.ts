import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "sendSummaryEmail" BOOLEAN DEFAULT TRUE NOT NULL
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "User"
  DROP COLUMN "sendSummaryEmail";
`)
  await client.end()
}
