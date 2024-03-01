import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScheduledJobTypeEnum') THEN
            EXECUTE 'CREATE TYPE "ScheduledJobTypeEnum" AS ENUM (''MEETING_STAGE_TIME_LIMIT_END'', ''LOCK_ORGANIZATION'', ''WARN_ORGANIZATION'')';
      END IF;
    END $$;

    CREATE TABLE "ScheduledJob" (
      "id" SERIAL PRIMARY KEY,
      "runAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      "type" "ScheduledJobTypeEnum" NOT NULL,
      "orgId" VARCHAR(100),
      "meetingId" VARCHAR(100)
    );

    CREATE INDEX IF NOT EXISTS "idx_ScheduledJob_orgId" ON "ScheduledJob"("orgId");
    CREATE INDEX IF NOT EXISTS "idx_ScheduledJob_runAt" ON "ScheduledJob"("runAt");
    CREATE INDEX IF NOT EXISTS "idx_ScheduledJob_type" ON "ScheduledJob"("type");
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "ScheduledJob";
    DROP TYPE IF EXISTS "ScheduledJobTypeEnum";
  `)
  await client.end()
}
