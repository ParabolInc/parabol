import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProbeSubjectTypeEnum') THEN
        CREATE TYPE "ProbeSubjectTypeEnum" AS ENUM ('email', 'domain');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProbeVerdictEnum') THEN
        CREATE TYPE "ProbeVerdictEnum" AS ENUM ('found', 'notFound', 'inconclusive');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProbeMatchTypeEnum') THEN
        CREATE TYPE "ProbeMatchTypeEnum" AS ENUM ('account', 'organization');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProbeStatusEnum') THEN
        CREATE TYPE "ProbeStatusEnum" AS ENUM ('running', 'done', 'error');
      END IF;
    END $$;
  `.execute(db)

  await sql`
    CREATE TABLE IF NOT EXISTS "IntegrationAccountProbe" (
      id serial PRIMARY KEY,
      subject citext NOT NULL,
      "subjectType" "ProbeSubjectTypeEnum" NOT NULL,
      service "IntegrationProviderServiceEnum" NOT NULL,
      verdict "ProbeVerdictEnum",
      "matchType" "ProbeMatchTypeEnum",
      evidence jsonb NOT NULL DEFAULT '{}',
      status "ProbeStatusEnum" NOT NULL DEFAULT 'running',
      error varchar(500),
      "detectedAt" timestamptz,
      "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "IntegrationAccountProbe_subject_key" UNIQUE (subject, "subjectType", service)
    )
  `.execute(db)

  // finds rows abandoned mid-run by a process that died before its finalizer could write
  await sql`
    CREATE INDEX IF NOT EXISTS "idx_IntegrationAccountProbe_running"
      ON "IntegrationAccountProbe" (status) WHERE status = 'running'
  `.execute(db)

  await sql`
    DROP TRIGGER IF EXISTS "update_IntegrationAccountProbe_updatedAt" ON "IntegrationAccountProbe";
    CREATE TRIGGER "update_IntegrationAccountProbe_updatedAt"
      BEFORE UPDATE ON "IntegrationAccountProbe"
      FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"()
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS "IntegrationAccountProbe"`.execute(db)
  await sql`
    DROP TYPE IF EXISTS "ProbeStatusEnum";
    DROP TYPE IF EXISTS "ProbeMatchTypeEnum";
    DROP TYPE IF EXISTS "ProbeVerdictEnum";
    DROP TYPE IF EXISTS "ProbeSubjectTypeEnum";
  `.execute(db)
}
