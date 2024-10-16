import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "Insight"
    ADD COLUMN "meetingsCount" INTEGER NOT NULL DEFAULT 0;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "Insight"
    DROP COLUMN IF EXISTS "meetingsCount";
  `)
  await client.end()
}
