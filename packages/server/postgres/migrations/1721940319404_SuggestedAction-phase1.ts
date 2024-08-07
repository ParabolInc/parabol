import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SuggestedActionTypeEnum') THEN
      CREATE TYPE "SuggestedActionTypeEnum" AS ENUM (
        'inviteYourTeam',
        'tryTheDemo',
        'createNewTeam',
        'tryRetroMeeting',
        'tryActionMeeting'
      );
    END IF;
    CREATE TABLE IF NOT EXISTS "SuggestedAction" (
      "id" VARCHAR(100) PRIMARY KEY,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "priority" SMALLINT NOT NULL DEFAULT 0,
      "removedAt" TIMESTAMP WITH TIME ZONE,
      "type" "SuggestedActionTypeEnum" NOT NULL,
      "teamId" VARCHAR(100),
      "userId" VARCHAR(100) NOT NULL,
      UNIQUE("userId", "type"),
      CONSTRAINT "fk_userId"
        FOREIGN KEY("userId")
          REFERENCES "User"("id")
          ON DELETE CASCADE,
      CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "idx_SuggestedAction_teamId" ON "SuggestedAction"("teamId");
    CREATE INDEX IF NOT EXISTS "idx_SuggestedAction_userId" ON "SuggestedAction"("userId");
  END $$;
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE "SuggestedAction";
    DROP TYPE "SuggestedActionTypeEnum";
    ` /* Do undo magic */)
  await client.end()
}
