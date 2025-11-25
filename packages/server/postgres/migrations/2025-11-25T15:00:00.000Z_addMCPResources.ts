import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "Organization"
    ADD COLUMN IF NOT EXISTS "mcpEnabled" boolean DEFAULT false;

    ALTER TABLE "Organization"
    ADD COLUMN IF NOT EXISTS "mcpResources" jsonb
    DEFAULT '{"organizations": false, "teams": false, "pages": false}'::jsonb;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "Organization"
    DROP COLUMN IF EXISTS "mcpEnabled";

    ALTER TABLE "Organization"
    DROP COLUMN IF EXISTS "mcpResources";
  `)
  await client.end()
}
