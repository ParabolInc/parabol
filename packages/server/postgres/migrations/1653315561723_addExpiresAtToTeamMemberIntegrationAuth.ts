import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "TeamMemberIntegrationAuth"
    ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "TeamMemberIntegrationAuth"
    DROP COLUMN IF EXISTS "expiresAt";
  `)
  await client.end()
}
