import {Kysely, PostgresDialect, sql} from 'kysely'
import {Client} from 'pg'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'
import getPgConfig from '../getPgConfig'

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskStatusEnum') THEN
      CREATE TYPE "TaskStatusEnum" AS ENUM (
        'active',
        'stuck',
        'done',
        'future'
      );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskTagEnum') THEN
      CREATE TYPE "TaskTagEnum" AS ENUM (
        'private',
        'archived'
      );
    END IF;
    CREATE TABLE IF NOT EXISTS "Task" (
      "id" VARCHAR(100) NOT NULL PRIMARY KEY,
      "content" VARCHAR(2000) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "createdBy" VARCHAR(100) NOT NULL,
      "doneMeetingId" VARCHAR(100),
      "dueDate" TIMESTAMP WITH TIME ZONE,
      "integration" JSONB,
      "integrationHash" VARCHAR(100),
      "meetingId" VARCHAR(100),
      "plaintextContent" VARCHAR(2000) NOT NULL,
      "sortOrder" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "status" "TaskStatusEnum" NOT NULL DEFAULT 'active',
      "tags" "TaskTagEnum"[] NOT NULL DEFAULT ARRAY[]::"TaskTagEnum"[],
      "teamId" VARCHAR(100) NOT NULL,
      "discussionId" VARCHAR(100),
      "threadParentId" VARCHAR(100),
      "threadSortOrder" INTEGER,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "userId" VARCHAR(100),
      CONSTRAINT "fk_createdBy"
        FOREIGN KEY("createdBy")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_doneMeetingId"
        FOREIGN KEY("doneMeetingId")
          REFERENCES "NewMeeting"("id")
          ON DELETE SET NULL,
      CONSTRAINT "fk_meetingId"
        FOREIGN KEY("meetingId")
          REFERENCES "NewMeeting"("id")
          ON DELETE SET NULL,
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_discussionId"
        FOREIGN KEY("discussionId")
          REFERENCES "Discussion"("id")
          ON DELETE SET NULL,
      CONSTRAINT "fk_userId"
        FOREIGN KEY("userId")
          REFERENCES "User"("id")
          ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS "idx_Task_createdBy" ON "Task"("createdBy");
    CREATE INDEX IF NOT EXISTS "idx_Task_discussionId" ON "Task"("discussionId") WHERE "discussionId" IS NOT NULL;
    CREATE INDEX IF NOT EXISTS "idx_Task_integrationHash" ON "Task"("integrationHash") WHERE "integrationHash" IS NOT NULL;
    CREATE INDEX IF NOT EXISTS "idx_Task_meetingId" ON "Task"("meetingId") WHERE "meetingId" IS NOT NULL;
    CREATE INDEX IF NOT EXISTS "idx_Task_teamId_updatedAt" ON "Task"("teamId", "updatedAt" DESC);
    CREATE INDEX IF NOT EXISTS "idx_Task_threadParentId" ON "Task"("threadParentId") WHERE "threadParentId" IS NOT NULL;
    CREATE INDEX IF NOT EXISTS "idx_Task_userId" ON "Task"("userId") WHERE "userId" IS NOT NULL;
    DROP TRIGGER IF EXISTS "update_Task_updatedAt" ON "Task";
    CREATE TRIGGER "update_Task_updatedAt" BEFORE UPDATE ON "Task" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

  END $$;
`.execute(pg)
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "Task";
    ` /* Do undo magic */)
  await client.end()
}
