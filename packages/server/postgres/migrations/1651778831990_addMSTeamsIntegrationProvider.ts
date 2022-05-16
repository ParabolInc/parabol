import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    ALTER TYPE "IntegrationProviderServiceEnum" ADD VALUE 'msTeams';
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
    DELETE FROM "IntegrationProvider" WHERE "service" = 'msTeams';

    ALTER TYPE "IntegrationProviderServiceEnum" RENAME TO "IntegrationProviderServiceEnum_delete";
    CREATE TYPE "IntegrationProviderServiceEnum" AS ENUM (
      'gitlab',
      'mattermost',
      'jiraServer',
      'azureDevOps'
    );
    ALTER TABLE "IntegrationProvider"
      ALTER COLUMN "service" TYPE "IntegrationProviderServiceEnum" USING "service"::text::"IntegrationProviderServiceEnum";

    ALTER TABLE "TeamMemberIntegrationAuth"
      ALTER COLUMN "service" TYPE "IntegrationProviderServiceEnum" USING "service"::text::"IntegrationProviderServiceEnum",

    DROP TYPE "IntegrationProviderServiceEnum_delete";
  END $$;
  `)
  await client.end()
}
