import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "domain" "citext" GENERATED ALWAYS AS (split_part(email, \'@\', 2)) STORED;
    CREATE INDEX IF NOT EXISTS "idx_User_domain" ON "User"("domain");
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "User"
    DROP COLUMN IF EXISTS "domain";
    DROP INDEX IF EXISTS "idx_User_domain";
  `)
  await client.end()
}
