import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "MeetingSeries"
      ADD COLUMN IF NOT EXISTS "teamId" VARCHAR(100) NOT NULL,
      ADD COLUMN IF NOT EXISTS "facilitatorId" VARCHAR(100) NOT NULL,
      ADD CONSTRAINT "fk_teamId"
        FOREIGN KEY("teamId")
          REFERENCES "Team"("id")
          ON DELETE CASCADE,
      ADD CONSTRAINT "fk_facilitatorId"
        FOREIGN KEY("facilitatorId")
        REFERENCES "User"("id") ON DELETE CASCADE;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "MeetingSeries"
      DROP COLUMN IF EXISTS "teamId",
      DROP COLUMN IF EXISTS "facilitatorId",
      DROP CONSTRAINT IF EXISTS "fk_teamId",
      DROP CONSTRAINT IF EXISTS "fk_facilitatorId";
  `)
  await client.end()
}
