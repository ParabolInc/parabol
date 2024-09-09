import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "User"
  ADD COLUMN "trialStartDate" TIMESTAMP WITH TIME ZONE;
  ALTER TABLE "Team"
  ADD COLUMN "trialStartDate" TIMESTAMP WITH TIME ZONE;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "User"
  DROP COLUMN "trialStartDate";
  ALTER TABLE "Team"
  DROP COLUMN "trialStartDate"`)
  await client.end()
}
