import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "RetroReflectionGroup"
  ADD COLUMN IF NOT EXISTS "discussionPromptQuestion" VARCHAR(2000)
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "RetroReflectionGroup"
  DROP COLUMN "discussionPromptQuestion";
`)
  await client.end()
}
