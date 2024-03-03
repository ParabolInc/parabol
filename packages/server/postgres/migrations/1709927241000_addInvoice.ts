import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceStatusEnum') THEN
            EXECUTE 'CREATE TYPE "InvoiceStatusEnum" AS ENUM (''FAILED'', ''PAID'', ''PENDING'', ''UPCOMING'')';
      END IF;
    END $$;

    CREATE TABLE "Invoice" (
      "id" VARCHAR(128) PRIMARY KEY, -- id is managed by our server app, values like upcoming_$orgId
      "amountDue" NUMERIC(10,2) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "coupon" JSONB,
      "total" NUMERIC(10,2) NOT NULL,
      "billingLeaderEmails" "citext"[] NOT NULL,
      "creditCard" JSONB,
      "endAt" TIMESTAMP WITH TIME ZONE NOT NULL,
      "invoiceDate" TIMESTAMP WITH TIME ZONE NOT NULL,
      "lines" JSONB[] NOT NULL DEFAULT '{}',
      "nextPeriodCharges" JSONB NOT NULL,
      "orgId" VARCHAR(100),
      "orgName" VARCHAR(100), -- Max len is 50 in EditableOrgName.tsx
      "paidAt" TIMESTAMP WITH TIME ZONE,
      "payUrl" VARCHAR(2056),
      "picture" VARCHAR(2056),
      "startAt" TIMESTAMP WITH TIME ZONE NOT NULL,
      "startingBalance" NUMERIC(10,2) NOT NULL,
      "status" "InvoiceStatusEnum" NOT NULL,
      "tier" "TierEnum" NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "idx_Invoice_orgId" ON "Invoice"("orgId");
    CREATE INDEX IF NOT EXISTS "idx_Invoice_startAt" ON "Invoice"("startAt");
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "Invoice";
    DROP TYPE IF EXISTS "InvoiceStatusEnum";
  `)
  await client.end()
}
