import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "MeetingSeries"
      ADD COLUMN IF NOT EXISTS "gcalSeriesId" VARCHAR(100);
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "MeetingSeries"
      DROP COLUMN IF EXISTS "gcalSeriesId";
  `)
  await client.end()
}
