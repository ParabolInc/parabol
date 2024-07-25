import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TeamDrawerEnum') THEN
      CREATE TYPE "TeamDrawerEnum" AS ENUM (
        'agenda',
        'manageTeam'
      );
    END IF;
    CREATE TABLE IF NOT EXISTS "TeamMember" (
      "id" VARCHAR(100) PRIMARY KEY,
      "isNotRemoved" BOOLEAN NOT NULL DEFAULT TRUE,
      "isLead" BOOLEAN NOT NULL DEFAULT FALSE,
      "isSpectatingPoker" BOOLEAN NOT NULL DEFAULT FALSE,
      "email" "citext" NOT NULL,
      "openDrawer" "TeamDrawerEnum",
      "picture" VARCHAR(2056) NOT NULL,
      "preferredName" VARCHAR(100) NOT NULL,
      "teamId" VARCHAR(100) NOT NULL,
      "userId" VARCHAR(100) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      CONSTRAINT "fk_userId"
        FOREIGN KEY("userId")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_TeamMember_teamId" ON "TeamMember"("teamId") WHERE "isNotRemoved" = TRUE;
    CREATE INDEX IF NOT EXISTS "idx_TeamMember_userId" ON "TeamMember"("userId") WHERE "isNotRemoved" = TRUE;
    DROP TRIGGER IF EXISTS "update_TeamMember_updatedAt" ON "TeamMember";
    CREATE TRIGGER "update_TeamMember_updatedAt" BEFORE UPDATE ON "TeamMember" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  END $$;
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE "TeamMember";
    DROP TYPE "TeamDrawerEnum";
    ` /* Do undo magic */)
  await client.end()
}
