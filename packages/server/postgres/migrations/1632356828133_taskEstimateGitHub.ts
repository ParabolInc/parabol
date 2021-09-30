import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "TaskEstimate"
    ADD COLUMN IF NOT EXISTS "githubLabelName" VARCHAR(50);
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "TaskEstimate"
    DROP COLUMN IF EXISTS "githubLabelName";
  `)
  await client.end()
}
