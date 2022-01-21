import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    UPDATE "User" SET "lastSeenAt" = "updatedAt" WHERE "lastSeenAt" IS NULL;
    ALTER TABLE "User" ALTER COLUMN "lastSeenAt" SET DEFAULT now();
    ALTER TABLE "User" ALTER COLUMN "lastSeenAt" SET NOT NULL;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "User" ALTER COLUMN "lastSeenAt" DROP DEFAULT;
    ALTER TABLE "User" ALTER COLUMN "lastSeenAt" DROP NOT NULL;
  `)
  await client.end()
}
