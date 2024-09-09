import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NewMeetingPhaseTypeEnum') THEN
      CREATE TYPE "NewMeetingPhaseTypeEnum" AS ENUM (
        'ESTIMATE',
        'SCOPE',
        'SUMMARY',
        'agendaitems',
        'checkin',
        'TEAM_HEALTH',
        'discuss',
        'firstcall',
        'group',
        'lastcall',
        'lobby',
        'reflect',
        'updates',
        'vote',
        'RESPONSES'
      );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MeetingTypeEnum') THEN
      CREATE TYPE "MeetingTypeEnum" AS ENUM (
        'action',
        'retrospective',
        'poker',
        'teamPrompt'
      );
    END IF;
    CREATE TABLE IF NOT EXISTS "MeetingSettings" (
      "id" VARCHAR(100) PRIMARY KEY,
      "phaseTypes" "NewMeetingPhaseTypeEnum"[] NOT NULL,
      "meetingType" "MeetingTypeEnum" NOT NULL,
      "teamId" VARCHAR(100) NOT NULL,
      "selectedTemplateId" VARCHAR(100),
      "jiraSearchQueries" JSONB,
      "maxVotesPerGroup" SMALLINT,
      "totalVotes" SMALLINT,
      "disableAnonymity" BOOLEAN,
      "videoMeetingURL" VARCHAR(2056),
      UNIQUE("teamId", "meetingType"),
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_selectedTemplateId"
        FOREIGN KEY("selectedTemplateId")
          REFERENCES "MeetingTemplate"("id")
          ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS "idx_MeetingSettings_teamId" ON "MeetingSettings"("teamId");
  END $$;
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE "MeetingSettings";
    DROP TYPE "NewMeetingPhaseTypeEnum";
    DROP TYPE "MeetingTypeEnum";
    ` /* Do undo magic */)
  await client.end()
}
