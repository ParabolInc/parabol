import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    CREATE TABLE IF NOT EXISTS "AgendaItem" (
      "id" VARCHAR(100) PRIMARY KEY,
      "content" VARCHAR(64) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      "isComplete" BOOLEAN NOT NULL DEFAULT FALSE,
      "sortOrder" VARCHAR(64) NOT NULL COLLATE "C",
      "teamId" VARCHAR(100) NOT NULL,
      "teamMemberId" VARCHAR(100) NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "meetingId" VARCHAR(100),
      "pinned" BOOLEAN NOT NULL DEFAULT FALSE,
      "pinnedParentId" VARCHAR(100),
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_teamMemberId"
        FOREIGN KEY("teamMemberId")
          REFERENCES "TeamMember"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_AgendaItem_teamId" ON "AgendaItem"("teamId");
    CREATE INDEX IF NOT EXISTS "idx_AgendaItem_meetingId" ON "AgendaItem"("meetingId");
    CREATE INDEX IF NOT EXISTS "idx_AgendaItem_teamMemberId" ON "AgendaItem"("teamMemberId");
    DROP TRIGGER IF EXISTS "update_AgendaItem_updatedAt" ON "AgendaItem";
    CREATE TRIGGER "update_AgendaItem_updatedAt" BEFORE UPDATE ON "AgendaItem" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  END $$;
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE "AgendaItem";
    ` /* Do undo magic */)
  await client.end()
}
