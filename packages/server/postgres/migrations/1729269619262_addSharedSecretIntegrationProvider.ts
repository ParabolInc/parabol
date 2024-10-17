import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    ALTER TYPE "IntegrationProviderAuthStrategyEnum" ADD VALUE IF NOT EXISTS 'sharedSecret';
    ALTER TABLE "IntegrationProvider"
      ADD COLUMN IF NOT EXISTS "sharedSecret" VARCHAR(255);

    ALTER TABLE "TeamMemberIntegrationAuth"
      ADD COLUMN IF NOT EXISTS "channel" VARCHAR(255);
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
    DELETE FROM "IntegrationProvider" WHERE "authStrategy" = 'sharedSecret';
    ALTER TYPE "IntegrationProviderAuthStrategyEnum" RENAME TO "IntegrationProviderAuthStrategyEnumA_delete";

    CREATE TYPE "IntegrationProviderAuthStrategyEnum" AS ENUM (
      'pat',
      'oauth2',
      'webhook',
      'oauth1'
    );

    ALTER TABLE "IntegrationProvider"
      DROP COLUMN IF EXISTS "sharedSecret",
      ALTER COLUMN "authStrategy" TYPE "IntegrationProviderAuthStrategyEnum" USING "authStrategy"::text::"IntegrationProviderAuthStrategyEnum";

    DROP TYPE "IntegrationProviderAuthStrategyEnumA_delete";

    ALTER TABLE "TeamMemberIntegrationAuth"
      DROP COLUMN IF EXISTS "channel";
  END $$;
  `)
  await client.end()
}
