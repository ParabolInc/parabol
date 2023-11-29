import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DO $$
    BEGIN
      ALTER TABLE "Team"
        ADD COLUMN IF NOT EXISTS "giveKudosWithEmoji" BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS "kudosEmoji" TEXT NOT NULL DEFAULT 'heart';
    END
    $$;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DO $$
    BEGIN
      ALTER TABLE "Team"
        DROP COLUMN "giveKudosWithEmoji",
        DROP COLUMN "kudosEmoji";
    END
    $$;
  `)
  await client.end()
}
