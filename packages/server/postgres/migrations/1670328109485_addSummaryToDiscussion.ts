import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "Discussion"
  ADD COLUMN IF NOT EXISTS "summary" VARCHAR(2000)
`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "Discussion"
<<<<<<< HEAD
  DROP COLUMN "summary";
=======
  DROP COLUMN IF EXISTS "summary";
>>>>>>> master
`)
  await client.end()
}
