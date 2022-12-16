import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "TeamPromptResponse"
  ADD COLUMN IF NOT EXISTS "isDraft" BOOLEAN NOT NULL DEFAULT FALSE
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "TeamPromptResponse"
  DROP COLUMN IF EXISTS "isDraft"
  `)
  await client.end()
}
