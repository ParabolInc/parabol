import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    CREATE TABLE IF NOT EXISTS "MeetingMember" (
      "id" VARCHAR(100) PRIMARY KEY,
      "meetingType" "MeetingTypeEnum" NOT NULL,
      "meetingId" VARCHAR(100) NOT NULL,
      "teamId" VARCHAR(100) NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "userId" VARCHAR(100) NOT NULL,
      "isSpectating" BOOLEAN,
      "votesRemaining" SMALLINT,
      CONSTRAINT "fk_meetingId"
        FOREIGN KEY("meetingId")
          REFERENCES "NewMeeting"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_userId"
        FOREIGN KEY("userId")
          REFERENCES "User"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_MeetingMember_meetingId" ON "MeetingMember"("meetingId");
    CREATE INDEX IF NOT EXISTS "idx_MeetingMember_teamId" ON "MeetingMember"("teamId");
    CREATE INDEX IF NOT EXISTS "idx_MeetingMember_userId" ON "MeetingMember"("userId");
    DROP TRIGGER IF EXISTS "update_MeetingMember_updatedAt" ON "MeetingMember";
    CREATE TRIGGER "update_MeetingMember_updatedAt" BEFORE UPDATE ON "MeetingMember" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  END $$;
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "MeetingMember";
    ` /* Do undo magic */)
  await client.end()
}
