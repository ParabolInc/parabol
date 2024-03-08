import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DO $$
    BEGIN
      ALTER TABLE "User"
        ADD COLUMN IF NOT EXISTS "freeCustomRetroTemplatesRemaining" INTEGER DEFAULT 2 NOT NULL;
      ALTER TABLE "User"
        ADD COLUMN IF NOT EXISTS "freeCustomPokerTemplatesRemaining" INTEGER DEFAULT 2 NOT NULL;
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
      ALTER TABLE "User"
        DROP COLUMN "freeCustomRetroTemplatesRemaining";
      ALTER TABLE "User"
        DROP COLUMN "freeCustomPokerTemplatesRemaining";
    END
    $$;
  `)
  await client.end()
}
