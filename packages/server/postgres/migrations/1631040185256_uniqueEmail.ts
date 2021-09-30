import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "idx_User_email" ON "User"("email");
    ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_email_key" CASCADE;
    DROP INDEX IF EXISTS "User_email_key" CASCADE;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DROP INDEX IF EXISTS "idx_User_email";
  `)
  await client.end()
}
