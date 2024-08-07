import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    ALTER TABLE "IntegrationProvider"
      DROP CONSTRAINT "unique_per_team_and_org";
    ALTER TABLE "IntegrationProvider"
      ADD CONSTRAINT "unique_per_team_and_org" UNIQUE NULLS NOT DISTINCT ("orgId", "teamId", "service", "authStrategy");
  END $$;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    ALTER TABLE "IntegrationProvider"
      DROP CONSTRAINT "unique_per_team_and_org";
    ALTER TABLE "IntegrationProvider"
      ADD CONSTRAINT "unique_per_team_and_org" UNIQUE ("orgId", "teamId", "service", "authStrategy");
  END $$;
  `)
  await client.end()
}
