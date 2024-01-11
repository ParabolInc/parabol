import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "Kudos"
    DROP CONSTRAINT IF EXISTS "fk_teamPromptResponseId";

    ALTER TABLE "Kudos"
      ADD COLUMN IF NOT EXISTS "teamPromptResponseId" INT,
      ADD CONSTRAINT "fk_teamPromptResponseId"
        FOREIGN KEY("teamPromptResponseId")
          REFERENCES "TeamPromptResponse"("id")
          ON DELETE CASCADE;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "Kudos"
      DROP COLUMN IF EXISTS "teamPromptResponseId";
  `)
  await client.end()
}
