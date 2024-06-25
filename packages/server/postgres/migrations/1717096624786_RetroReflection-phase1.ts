import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GoogleAnalyzedEntity') THEN
      CREATE TYPE "GoogleAnalyzedEntity" AS (name text, salience real, lemma text);
    END IF;

    CREATE TABLE IF NOT EXISTS "RetroReflection" (
      "id" VARCHAR(100) PRIMARY KEY,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      "meetingId" VARCHAR(100) NOT NULL,
      "promptId" VARCHAR(111) NOT NULL,
      "sortOrder" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "creatorId" VARCHAR(100),
      "content" VARCHAR(2000) NOT NULL,
      "plaintextContent" VARCHAR(2000) NOT NULL,
      "entities" "GoogleAnalyzedEntity"[] NOT NULL DEFAULT array[]::"GoogleAnalyzedEntity"[],
      "sentimentScore" REAL,
      "reactjis" "Reactji"[] NOT NULL DEFAULT array[]::"Reactji"[],
      "reflectionGroupId" VARCHAR(100) NOT NULL,
      CONSTRAINT "fk_creatorId"
        FOREIGN KEY("creatorId")
          REFERENCES "User"("id")
          ON DELETE SET NULL,
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
  END $$;

`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "RetroReflection";
    DROP TYPE IF EXISTS "GoogleAnalyzedEntity" CASCADE;
  `)
  await client.end()
}
