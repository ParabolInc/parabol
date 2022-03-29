import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    ALTER TYPE "IntegrationProviderServiceEnum" ADD VALUE 'azureDevOps';

    AlTER TABLE "TeamMemberIntegrationAuth"
      ALTER COLUMN "accessToken" TYPE VARCHAR(2056),
      ALTER COLUMN "refreshToken" TYPE VARCHAR(2056);

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
    DELETE FROM "IntegrationProvider" WHERE "service" = 'azureDevOps';

    ALTER TYPE "IntegrationProviderServiceEnum" RENAME TO "IntegrationProviderServiceEnum_delete";

    CREATE TYPE "IntegrationProviderServiceEnum" AS ENUM (
      'gitlab',
      'mattermost',
      'jiraServer'
    );

    ALTER TABLE "IntegrationProvider"
      ALTER COLUMN "service" TYPE "IntegrationProviderServiceEnum" USING "service"::text::"IntegrationProviderServiceEnum",
      ADD CONSTRAINT global_provider_must_be_oauth2 CHECK (
        "scopeGlobal" IS FALSE OR ("scopeGlobal" = TRUE AND "authStrategy" = 'oauth2')
      );

    ALTER TABLE "TeamMemberIntegrationAuth"
      ALTER COLUMN "service" TYPE "IntegrationProviderServiceEnum" USING "service"::text::"IntegrationProviderServiceEnum",
      ALTER COLUMN "accessToken" TYPE VARCHAR(1028),
      ALTER COLUMN "refreshToken" TYPE VARCHAR(1028);

    DROP TYPE "IntegrationProviderServiceEnum_delete";
  END $$;
  `)
  await client.end()
}
