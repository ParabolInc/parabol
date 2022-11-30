import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    ALTER TYPE "IntegrationProviderServiceEnum" ADD VALUE IF NOT EXISTS 'jiraServer';
    ALTER TYPE "IntegrationProviderAuthStrategyEnum" ADD VALUE IF NOT EXISTS 'oauth1';
    ALTER TABLE "IntegrationProvider"
      ADD COLUMN IF NOT EXISTS "consumerKey" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "consumerSecret" TEXT;
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
      DROP COLUMN IF EXISTS "consumerKey",
      DROP COLUMN IF EXISTS "consumerSecret",
      DROP CONSTRAINT global_provider_must_be_oauth2;

    DELETE FROM "IntegrationProvider" WHERE "service" = 'jiraServer' OR "authStrategy" = 'oauth1';

    ALTER TYPE "IntegrationProviderServiceEnum" RENAME TO "IntegrationProviderServiceEnum_delete";
    ALTER TYPE "IntegrationProviderAuthStrategyEnum" RENAME TO "IntegrationProviderAuthStrategyEnumA_delete";

    CREATE TYPE "IntegrationProviderServiceEnum" AS ENUM (
      'gitlab',
      'mattermost'
    );
    CREATE TYPE "IntegrationProviderAuthStrategyEnum" AS ENUM (
      'pat',
      'oauth2',
      'webhook'
    );

    ALTER TABLE "IntegrationProvider"
      ALTER COLUMN "service" TYPE "IntegrationProviderServiceEnum" USING "service"::text::"IntegrationProviderServiceEnum",
      ALTER COLUMN "authStrategy" TYPE "IntegrationProviderAuthStrategyEnum" USING "authStrategy"::text::"IntegrationProviderAuthStrategyEnum",
      ADD CONSTRAINT global_provider_must_be_oauth2 CHECK (
        "scopeGlobal" IS FALSE OR ("scopeGlobal" = TRUE AND "authStrategy" = 'oauth2')
      );

    ALTER TABLE "TeamMemberIntegrationAuth"
      ALTER COLUMN "service" TYPE "IntegrationProviderServiceEnum" USING "service"::text::"IntegrationProviderServiceEnum";

    DROP TYPE "IntegrationProviderServiceEnum_delete";
    DROP TYPE "IntegrationProviderAuthStrategyEnumA_delete";
  END $$;
  `)
  await client.end()
}
