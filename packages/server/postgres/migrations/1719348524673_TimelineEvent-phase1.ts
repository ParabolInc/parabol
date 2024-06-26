import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  // teamId, orgId, meetingId
  await client.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TimelineEventEnum') THEN
      CREATE TYPE "TimelineEventEnum" AS ENUM (
        'TEAM_PROMPT_COMPLETE',
        'POKER_COMPLETE',
        'actionComplete',
        'createdTeam',
        'joinedParabol',
        'retroComplete'
      );
    END IF;

    CREATE TABLE IF NOT EXISTS "TimelineEvent" (
      "id" VARCHAR(100) PRIMARY KEY,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "interactionCount" SMALLINT NOT NULL DEFAULT 0,
      "seenCount" SMALLINT NOT NULL DEFAULT 0,
      "type" "TimelineEventEnum" NOT NULL,
      "userId" VARCHAR(100) NOT NULL,
      "teamId" VARCHAR(100),
      "orgId" VARCHAR(100),
      "meetingId" VARCHAR(100),
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      CONSTRAINT "fk_userId"
        FOREIGN KEY("userId")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_TimelineEvent_userId_createdAt" ON "TimelineEvent"("userId", "createdAt") WHERE "isActive" = TRUE;
    CREATE INDEX IF NOT EXISTS "idx_TimelineEvent_meetingId" ON "TimelineEvent"("meetingId");
  END $$;
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE "TimelineEvent";
    DROP TYPE "TimelineEventEnum";
    ` /* Do undo magic */)
  await client.end()
}
