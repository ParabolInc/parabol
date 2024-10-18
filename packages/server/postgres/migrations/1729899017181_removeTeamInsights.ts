import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DO $$
    BEGIN
      ALTER TABLE "Team"
        DROP COLUMN IF EXISTS "insightsUpdatedAt",
        DROP COLUMN IF EXISTS "mostUsedEmojis",
        DROP COLUMN IF EXISTS "topRetroTemplates",
        DROP COLUMN IF EXISTS "meetingEngagement";
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
        ADD COLUMN IF NOT EXISTS "insightsUpdatedAt" TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS "mostUsedEmojis" JSONB,
        ADD COLUMN IF NOT EXISTS "topRetroTemplates" JSONB,
        ADD COLUMN IF NOT EXISTS "meetingEngagement" JSONB;
    END
    $$;
  `)
  await client.end()
}
