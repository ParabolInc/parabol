import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "freeCustomTemplatesRemaining" INTEGER DEFAULT 2 NOT NULL
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "User"
  DROP COLUMN "freeCustomTemplatesRemaining";
  `)
  await client.end()
}
