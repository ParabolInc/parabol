import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    ALTER TABLE "IntegrationProvider"
      ADD COLUMN IF NOT EXISTS "orgId" VARCHAR(100),
      ALTER COLUMN "teamId" DROP NOT NULL,
      DROP CONSTRAINT "IntegrationProvider_teamId_service_authStrategy_key";
    UPDATE "IntegrationProvider"
      SET
        "orgId" = (SELECT "orgId" FROM "Team" WHERE "id" = "teamId"),
        "teamId" = NULL
      WHERE "scope" = 'org';
    UPDATE "IntegrationProvider"
      SET
        "teamId" = NULL
      WHERE "scope" = 'global';
    ALTER TABLE "IntegrationProvider"
      ADD CONSTRAINT "unique_per_team_and_org" UNIQUE ("orgId", "teamId", "service", "authStrategy"),
      ADD CONSTRAINT "scope_org_has_only_orgId" CHECK
        ("scope" <> 'org' OR ("orgId" IS NOT NULL AND "teamId" IS NULL)),
      ADD CONSTRAINT "scope_team_has_only_teamId" CHECK
        ("scope" <> 'team' OR ("teamId" IS NOT NULL AND "orgId" IS NULL)),
      ADD CONSTRAINT "scope_global_has_neither_teamId_orgId" CHECK
        ("scope" <> 'global' OR ("orgId" IS NULL AND "teamId" IS NULL));
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
      DROP CONSTRAINT "scope_org_has_only_orgId",
      DROP CONSTRAINT "scope_team_has_only_teamId",
      DROP CONSTRAINT "scope_global_has_neither_teamId_orgId";
    UPDATE "IntegrationProvider" AS "ip"
      SET
        "teamId" = (SELECT "id" FROM "Team" AS "t" WHERE "t"."orgId" = "ip"."orgId" LIMIT 1)
      WHERE "scope" = 'org';
    UPDATE "IntegrationProvider"
      SET
        "teamId" = 'aGhostTeam'
      WHERE "scope" = 'global';
    ALTER TABLE "IntegrationProvider"
      DROP CONSTRAINT "unique_per_team_and_org",
      DROP COLUMN "orgId",
      ALTER COLUMN "teamId" SET NOT NULL,
      ADD CONSTRAINT "IntegrationProvider_teamId_service_authStrategy_key" UNIQUE ("teamId", "service", "authStrategy");
  END $$;
  `)
  await client.end()
}
