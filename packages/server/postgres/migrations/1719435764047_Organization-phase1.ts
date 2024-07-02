import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  //activeDomain has a few that are longer than 100
  await client.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreditCard') THEN
      CREATE TYPE "CreditCard" AS (brand text, expiry text, last4 smallint);
    END IF;

    CREATE TABLE IF NOT EXISTS "Organization" (
      "id" VARCHAR(100) PRIMARY KEY,
      "activeDomain" VARCHAR(100),
      "isActiveDomainTouched" BOOLEAN NOT NULL DEFAULT FALSE,
      "creditCard" "CreditCard",
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "name" VARCHAR(100) NOT NULL,
      "payLaterClickCount" SMALLINT NOT NULL DEFAULT 0,
      "periodEnd" TIMESTAMP WITH TIME ZONE,
      "periodStart" TIMESTAMP WITH TIME ZONE,
      "picture" VARCHAR(2056),
      "showConversionModal" BOOLEAN NOT NULL DEFAULT FALSE,
      "stripeId" VARCHAR(100),
      "stripeSubscriptionId" VARCHAR(100),
      "upcomingInvoiceEmailSentAt" TIMESTAMP WITH TIME ZONE,
      "tier" "TierEnum" NOT NULL DEFAULT 'starter',
      "tierLimitExceededAt" TIMESTAMP WITH TIME ZONE,
      "trialStartDate" TIMESTAMP WITH TIME ZONE,
      "scheduledLockAt" TIMESTAMP WITH TIME ZONE,
      "lockedAt" TIMESTAMP WITH TIME ZONE,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "featureFlags" TEXT[] NOT NULL DEFAULT '{}'
    );
    CREATE INDEX IF NOT EXISTS "idx_Organization_activeDomain" ON "Organization"("activeDomain");
    CREATE INDEX IF NOT EXISTS "idx_Organization_tier" ON "Organization"("tier");
    DROP TRIGGER IF EXISTS "update_Organization_updatedAt" ON "Organization";
    CREATE TRIGGER "update_Organization_updatedAt" BEFORE UPDATE ON "Organization" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  END $$;
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE "Organization";
    DROP TYPE "CreditCard";
    ` /* Do undo magic */)
  await client.end()
}
