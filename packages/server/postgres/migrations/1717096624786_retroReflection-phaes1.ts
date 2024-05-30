import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  CREATE TABLE IF NOT EXISTS "RetroReflection" (
    "id" VARCHAR(100) PRIMARY KEY,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "meetingId" VARCHAR(100) NOT NULL,
    "promptId" VARCHAR(100) NOT NULL,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "creatorId" VARCHAR(100) NOT NULL,
    "content" VARCHAR(2000) NOT NULL,
    "plaintextContent" VARCHAR(2000) NOT NULL,
    "entities" JSONB[] NOT NULL DEFAULT '{}',
    "sentimentScore" INT,
    "reactjis" JSONB[] NOT NULL DEFAULT '{}',
    "reflectionGroupId" VARCHAR(100) NOT NULL,
    CONSTRAINT "fk_creatorId"
      FOREIGN KEY("creatorId")
        REFERENCES "User"("id")
        ON DELETE CASCADE,
    CONSTRAINT "fk_reflectionGroupId"
      FOREIGN KEY("reflectionGroupId")
        REFERENCES "RetroReflectionGroup"("id")
        ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS "idx_RetroReflection_meetingId" ON "RetroReflection"("meetingId");
  CREATE INDEX IF NOT EXISTS "idx_RetroReflection_promptId" ON "RetroReflection"("promptId");
  CREATE INDEX IF NOT EXISTS "idx_RetroReflection_creatorId" ON "RetroReflection"("creatorId");
  CREATE INDEX IF NOT EXISTS "idx_RetroReflection_reflectionGroupId" ON "RetroReflection"("reflectionGroupId");
  DROP TRIGGER IF EXISTS "update_RetroReflection_updatedAt" ON "RetroReflection";
  CREATE TRIGGER "update_RetroReflection_updatedAt" BEFORE UPDATE ON "RetroReflection" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DROP TABLE IF EXISTS "RetroReflection";
  `)
  await client.end()
}
