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
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationStatusEnum') THEN
      CREATE TYPE "NotificationStatusEnum" AS ENUM (
        'UNREAD',
        'CLICKED',
        'READ'
      );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationTypeEnum') THEN
      CREATE TYPE "NotificationTypeEnum" AS ENUM (
        'DISCUSSION_MENTIONED',
        'KICKED_OUT',
        'MEETING_STAGE_TIME_LIMIT_END',
        'PAYMENT_REJECTED',
        'PROMOTE_TO_BILLING_LEADER',
        'RESPONSE_MENTIONED',
        'RESPONSE_REPLIED',
        'MENTIONED',
        'TASK_INVOLVES',
        'TEAM_ARCHIVED',
        'TEAM_INVITATION',
        'TEAMS_LIMIT_EXCEEDED',
        'TEAMS_LIMIT_REMINDER',
        'PROMPT_TO_JOIN_ORG',
        'REQUEST_TO_JOIN_ORG'
      );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskInvolvementEnum') THEN
      CREATE TYPE "TaskInvolvementEnum" AS ENUM (
        'ASSIGNEE',
        'MENTIONEE'
      );
    END IF;
    CREATE TABLE IF NOT EXISTS "Notification" (
      "id" VARCHAR(100) NOT NULL PRIMARY KEY,
      "status" "NotificationStatusEnum" NOT NULL DEFAULT 'UNREAD',
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "type" "NotificationTypeEnum" NOT NULL,
      "userId" VARCHAR(100) NOT NULL,
      -- DISCUSSION_MENTIONED
      "meetingId" VARCHAR(100),
      "authorId" VARCHAR(100),
      "commentId" VARCHAR(100),
      "discussionId" VARCHAR(100),
      -- KICKED_OUT
      "teamId" VARCHAR(100),
      "evictorUserId" VARCHAR(100),
      -- MENTIONED
      "senderName" VARCHAR(100),
      "senderPicture" VARCHAR(2056),
      "senderUserId" VARCHAR(100),
      "meetingName" VARCHAR(100),
      "retroReflectionId" VARCHAR(100),
      "retroDiscussStageIdx" SMALLINT,
      -- PAYMENT_REJECTED
      "orgId" VARCHAR(100),
      "last4" SMALLINT,
      "brand" VARCHAR(50),
      -- PROMPT_TO_JOIN_ORG
      "activeDomain" VARCHAR(100),
      -- REQUEST_TO_JOIN_ORG
      "domainJoinRequestId" INTEGER,
      "email" "citext",
      "name" VARCHAR(100),
      "picture" VARCHAR(2056),
      "requestCreatedBy" VARCHAR(100),
      -- RESPONSE_MENTIONED
      "responseId" INTEGER,
      -- TASK_INVOLVES
      "changeAuthorId" VARCHAR(100),
      "involvement" "TaskInvolvementEnum",
      "taskId" VARCHAR(100),
      -- TEAM_ARCHIVED
      "archivorUserId" VARCHAR(100),
      -- TEAM_INVITATION
      "invitationId" VARCHAR(100),
      -- TEAMS_LIMIT_EXCEEDED
      "orgName" VARCHAR(100),
      "orgPicture" VARCHAR(2056),
      -- TEAMS_LIMIT_REMINDER
      "scheduledLockAt" TIMESTAMP WITH TIME ZONE,
      CONSTRAINT "fk_meetingId"
        FOREIGN KEY("meetingId")
          REFERENCES "NewMeeting"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_userId"
        FOREIGN KEY("userId")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_changeAuthorId"
        FOREIGN KEY("changeAuthorId")
          REFERENCES "TeamMember"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_taskId"
        FOREIGN KEY("taskId")
          REFERENCES "Task"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_archivorUserId"
        FOREIGN KEY("archivorUserId")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_orgId"
        FOREIGN KEY("orgId")
          REFERENCES "Organization"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_evictorUserId"
        FOREIGN KEY("evictorUserId")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_invitationId"
        FOREIGN KEY("invitationId")
          REFERENCES "TeamInvitation"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_responseId"
        FOREIGN KEY("responseId")
          REFERENCES "TeamPromptResponse"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_authorId"
        FOREIGN KEY("authorId")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_commentId"
        FOREIGN KEY("commentId")
          REFERENCES "Comment"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_Notification_userId" ON "Notification"("userId");
    CREATE INDEX IF NOT EXISTS "idx_Notification_teamId" ON "Notification"("teamId") WHERE "teamId" IS NOT NULL;
    CREATE INDEX IF NOT EXISTS "idx_Notification_orgId" ON "Notification"("orgId") WHERE "orgId" IS NOT NULL;
  END $$;
`.execute(pg)
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "Notification";
    ` /* Do undo magic */)
  await client.end()
}
