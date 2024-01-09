import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DO $$
    BEGIN
      ALTER TABLE "Team"
        ADD COLUMN IF NOT EXISTS "kudosEmojiUnicode" VARCHAR(100) NOT NULL DEFAULT '❤️';
      ALTER TABLE "Kudos"
        ADD COLUMN IF NOT EXISTS "emojiUnicode" VARCHAR(100) NOT NULL DEFAULT '❤️';
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
        DROP COLUMN "kudosEmojiUnicode";
      ALTER TABLE "Kudos"
        DROP COLUMN "emojiUnicode";
    END
    $$;
  `)
  await client.end()
}
