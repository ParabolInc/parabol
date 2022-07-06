import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "AzureDevOpsDimensionFieldMap"
    ADD COLUMN IF NOT EXISTS "workItemType" VARCHAR(255) NOT NULL;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "AzureDevOpsDimensionFieldMap"
    DROP COLUMN IF EXISTS "workItemType";
  `)
  await client.end()
}
