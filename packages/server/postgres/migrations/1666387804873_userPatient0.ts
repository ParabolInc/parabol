import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isPatient0" BOOLEAN DEFAULT FALSE;
  `)
  await client.query(`
  UPDATE "User" u
  SET "isPatient0" = COALESCE("createdAt" = (SELECT "createdAt" FROM "User" WHERE "domain" = u.domain ORDER BY "createdAt" LIMIT 1), false);
  `)
  await client.query(`
    ALTER TABLE "User"
    ALTER COLUMN "isPatient0" SET NOT NULL
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "User"
    DROP COLUMN IF EXISTS "isPatient0"
  `)
  await client.end()
}
