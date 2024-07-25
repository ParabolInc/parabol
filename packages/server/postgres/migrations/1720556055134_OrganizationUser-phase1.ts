import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrgUserRoleEnum') THEN
      CREATE TYPE "OrgUserRoleEnum" AS ENUM (
        'BILLING_LEADER',
        'ORG_ADMIN'
      );
    END IF;
    CREATE TABLE IF NOT EXISTS "OrganizationUser" (
      "id" VARCHAR(100) PRIMARY KEY,
      "suggestedTier" "TierEnum",
      "inactive" BOOLEAN NOT NULL DEFAULT FALSE,
      "joinedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "orgId" VARCHAR(100) NOT NULL,
      "removedAt" TIMESTAMP WITH TIME ZONE,
      "role" "OrgUserRoleEnum",
      "userId" VARCHAR(100) NOT NULL,
      "tier" "TierEnum" NOT NULL,
      "trialStartDate" TIMESTAMP WITH TIME ZONE,
      CONSTRAINT "fk_userId"
        FOREIGN KEY("userId")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_orgId"
        FOREIGN KEY("orgId")
          REFERENCES "Organization"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_OrganizationUser_tier" ON "OrganizationUser"("tier") WHERE "removedAt" IS NULL AND "inactive" = FALSE;
    CREATE INDEX IF NOT EXISTS "idx_OrganizationUser_orgId" ON "OrganizationUser"("orgId") WHERE "removedAt" IS NULL;
    CREATE INDEX IF NOT EXISTS "idx_OrganizationUser_userId" ON "OrganizationUser"("userId") WHERE "removedAt" IS NULL;

  END $$;
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE "OrganizationUser";
    DROP TYPE "OrgUserRoleEnum";
    ` /* Do undo magic */)
  await client.end()
}
