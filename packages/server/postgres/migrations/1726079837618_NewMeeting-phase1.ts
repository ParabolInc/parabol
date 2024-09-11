import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()

  // Notable changes
  // - SlackTs is now a double precision
  // - facilitatorUserId is nullable in the case of a user hard delete
  // - hasScheduledEndTime index changed to scheduledEndTime

  await client.query(`
  DO $$
  BEGIN
    CREATE TABLE IF NOT EXISTS "NewMeeting" (
      "id" VARCHAR(100) PRIMARY KEY,
      "isLegacy" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "createdBy" VARCHAR(100),
      "endedAt" TIMESTAMP WITH TIME ZONE,
      "facilitatorStageId" VARCHAR(100),
      "facilitatorUserId" VARCHAR(100),
      "meetingCount" INT NOT NULL,
      "meetingNumber" INT NOT NULL,
      "name" VARCHAR(100) NOT NULL,
      "summarySentAt" TIMESTAMP WITH TIME ZONE,
      "teamId" VARCHAR(100) NOT NULL,
      "meetingType" "MeetingTypeEnum" NOT NULL,
      "phases" JSONB NOT NULL,
      "showConversionModal" BOOLEAN NOT NULL DEFAULT FALSE,
      "meetingSeriesId" INT,
      "scheduledEndTime" TIMESTAMP WITH TIME ZONE,
      "summary" VARCHAR(10000),
      "sentimentScore" DOUBLE PRECISION,
      "usedReactjis" JSONB,
      "slackTs" DOUBLE PRECISION,
      "engagement" DOUBLE PRECISION,
      "totalVotes" INT,
      "maxVotesPerGroup" SMALLINT,
      "disableAnonymity" BOOLEAN,
      "commentCount" INT,
      "taskCount" INT,
      "agendaItemCount" INT,
      "storyCount" INT,
      "templateId" VARCHAR(100),
      "topicCount" INT,
      "reflectionCount" INT,
      "transcription" JSONB,
      "recallBotId" VARCHAR(255),
      "videoMeetingURL" VARCHAR(2048),
      "autogroupReflectionGroups" JSONB,
      "resetReflectionGroups" JSONB,
      "templateRefId" VARCHAR(25),
      "meetingPrompt" VARCHAR(255),
      CONSTRAINT "fk_createdBy"
        FOREIGN KEY("createdBy")
          REFERENCES "User"("id")
          ON DELETE SET NULL,
      CONSTRAINT "fk_facilitatorUserId"
        FOREIGN KEY("facilitatorUserId")
          REFERENCES "User"("id")
          ON DELETE SET NULL,
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE SET NULL,
      CONSTRAINT "fk_meetingSeriesId"
        FOREIGN KEY("meetingSeriesId")
          REFERENCES "MeetingSeries"("id")
          ON DELETE SET NULL,
      CONSTRAINT "fk_templateId"
        FOREIGN KEY("templateId")
          REFERENCES "MeetingTemplate"("id")
          ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS "idx_NewMeeting_createdAt" ON "NewMeeting"("createdAt");
    CREATE INDEX IF NOT EXISTS "idx_NewMeeting_facilitatorUserId" ON "NewMeeting"("facilitatorUserId");
    CREATE INDEX IF NOT EXISTS "idx_NewMeeting_scheduledEndTime" ON "NewMeeting"("scheduledEndTime");
    CREATE INDEX IF NOT EXISTS "idx_NewMeeting_meetingSeriesId" ON "NewMeeting"("meetingSeriesId");
    CREATE INDEX IF NOT EXISTS "idx_NewMeeting_teamId" ON "NewMeeting"("teamId");
    CREATE INDEX IF NOT EXISTS "idx_NewMeeting_templateId" ON "NewMeeting"("templateId");
    DROP TRIGGER IF EXISTS "update_NewMeeting_updatedAt" ON "NewMeeting";
    CREATE TRIGGER "update_NewMeeting_updatedAt" BEFORE UPDATE ON "NewMeeting" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  END $$;
`)

  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "NewMeeting";
    ` /* Do undo magic */)
  await client.end()
}
