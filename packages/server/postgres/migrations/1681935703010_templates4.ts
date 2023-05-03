import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()

  await client.query(`
    CREATE TABLE IF NOT EXISTS "MeetingTemplateUserFavorite" (
      "userId" VARCHAR(100) NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "templateId" VARCHAR(100) NOT NULL REFERENCES "MeetingTemplate"("id") ON DELETE CASCADE
    );
    ALTER TABLE "MeetingTemplate"
      DROP CONSTRAINT IF EXISTS "fk_parentTemplateId",
      ADD CONSTRAINT "fk_parentTemplateId"
        FOREIGN KEY("parentTemplateId")
          REFERENCES "MeetingTemplate"("id")
          ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS "illustrationUrl" VARCHAR(512),
      ADD COLUMN IF NOT EXISTS "hideStartingAt" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "hideEndingAt" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "mainCategory" VARCHAR(100);
  `)
  // TODO: illustrationUrl NOT NULL, mainCategory NOT NULL, prime existing rows after server guarantees extra columns
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "MeetingTemplateUserFavorite";
    ALTER TABLE "MeetingTemplate"
      DROP CONSTRAINT IF EXISTS "fk_parentTemplateId",
      DROP COLUMN IF EXISTS "illustrationUrl",
      DROP COLUMN IF EXISTS "hideStartingAt",
      DROP COLUMN IF EXISTS "hideEndingAt",
      DROP COLUMN IF EXISTS "mainCategory";
  `)
  await client.end()
}
