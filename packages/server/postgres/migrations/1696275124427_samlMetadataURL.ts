import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "SAML"
  ADD COLUMN IF NOT EXISTS "metadataURL" VARCHAR(2048);
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "SAML"
  DROP COLUMN IF EXISTS "metadataURL";`)
  await client.end()
}
