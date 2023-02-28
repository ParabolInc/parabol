import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TYPE IF EXISTS "SharingScopeEnum";
    CREATE TYPE "SharingScopeEnum" AS ENUM (
      'USER',
      'TEAM',
      'ORGANIZATION',
      'PUBLIC'
    );
    CREATE TABLE IF NOT EXISTS "MeetingTemplate" (
      id VARCHAR(100) PRIMARY KEY,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      name VARCHAR(250) NOT NULL,
      "teamId" VARCHAR(100) NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      scope "SharingScopeEnum" NOT NULL DEFAULT 'TEAM',
      "orgId" VARCHAR(100) NOT NULL,
      "parentTemplateId" VARCHAR(100),
      "lastUsedAt" TIMESTAMP WITH TIME ZONE,
      type "MeetingTypeEnum" NOT NULL,
      "isStarter" BOOLEAN NOT NULL DEFAULT FALSE,
      "isFree" BOOLEAN NOT NULL DEFAULT FALSE
    );
    CREATE INDEX IF NOT EXISTS "idx_MeetingTemplate_teamId" ON "MeetingTemplate"("teamId");
    CREATE INDEX IF NOT EXISTS "idx_MeetingTemplate_orgId" ON "MeetingTemplate"("orgId");
    DROP TRIGGER IF EXISTS "update_MeetingTemplate_updatedAt" ON "MeetingTemplate";
    CREATE TRIGGER "update_MeetingTemplate_updatedAt" BEFORE UPDATE ON "MeetingTemplate" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  // save for next migraiton: parentTemplateId -> REFERENCES "MeetingTemplate"("id") ON DELETE SET NULL
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DROP TABLE IF EXISTS "MeetingTemplate";
  DROP TYPE "SharingScopeEnum";
  `)
  await client.end()
}
