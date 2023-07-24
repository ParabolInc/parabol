import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  CREATE TABLE IF NOT EXISTS "RetroReflectionGroup" (
    "id" VARCHAR(100) PRIMARY KEY,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "meetingId" VARCHAR(100) NOT NULL,
    "promptId" VARCHAR(100) NOT NULL,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "voterIds" VARCHAR(100)[] NOT NULL DEFAULT '{}',
    "smartTitle" VARCHAR(255),
    "title" VARCHAR(255),
    "summary" VARCHAR(2000)
  );
  CREATE INDEX IF NOT EXISTS "idx_RetroReflectionGroup_meetingId" ON "RetroReflectionGroup"("meetingId");
  CREATE INDEX IF NOT EXISTS "idx_RetroReflectionGroup_promptId" ON "RetroReflectionGroup"("promptId");
  DROP TRIGGER IF EXISTS "update_RetroReflectionGroup_updatedAt" ON "RetroReflectionGroup";
  CREATE TRIGGER "update_RetroReflectionGroup_updatedAt" BEFORE UPDATE ON "RetroReflectionGroup" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DROP TABLE IF EXISTS "RetroReflectionGroup";
  `)
  await client.end()
}
