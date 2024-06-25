import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    ALTER TABLE "IntegrationProvider"
      DROP CONSTRAINT IF EXISTS global_provider_must_be_oauth2;
  END $$;
  `)
  await client.end()
}

export async function down() {
  //noop, the constraint was a leftover and served no purpose
}
