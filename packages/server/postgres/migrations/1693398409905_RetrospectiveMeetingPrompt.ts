import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    CREATE TABLE IF NOT EXISTS "RetrospectivePrompt" (
      "id" SERIAL PRIMARY KEY,
      "phaseId" VARCHAR(100) NOT NULL,
      "meetingId" VARCHAR(100) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "description" VARCHAR(255),
      "groupColor" VARCHAR(7),
      "sortOrder" INT NOT NULL,
      "question" VARCHAR(100) NOT NULL
    );

    DROP TRIGGER IF EXISTS "update_RetrospectivePrompt_updatedAt" ON "RetrospectivePrompt";
    CREATE TRIGGER "update_RetrospectivePrompt_updatedAt" BEFORE UPDATE ON "RetrospectivePrompt" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_RetrospectivePrompt_updatedAt" ON "RetrospectivePrompt";
    DROP TABLE IF EXISTS "RetrospectivePrompt";
  `)
  await client.end()
}
