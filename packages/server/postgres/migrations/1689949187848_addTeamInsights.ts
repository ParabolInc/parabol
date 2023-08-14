import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DO $$
    BEGIN
      ALTER TABLE "Team"
        ADD COLUMN IF NOT EXISTS "insightsUpdatedAt" TIMESTAMP WITH TIME ZONE,
        -- 3 most used emojis in format [{id: string, count: number}]
        ADD COLUMN IF NOT EXISTS "mostUsedEmojis" JSONB,
        -- 3 most used retro templates in format [{templateId: string, count: number}]
        ADD COLUMN IF NOT EXISTS "topRetroTemplates" JSONB,
        -- meeting engagement in format {meetingType: string, engagement: number}
        ADD COLUMN IF NOT EXISTS "meetingEngagement" JSONB;
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
        DROP COLUMN "mostUsedEmojis",
        DROP COLUMN "insightsUpdatedAt",
        DROP COLUMN "topRetroTemplates",
        DROP COLUMN "meetingEngagement";
    END
    $$;
  `)
  await client.end()
}
