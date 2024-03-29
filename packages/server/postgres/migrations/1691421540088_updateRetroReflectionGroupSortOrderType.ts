import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "RetroReflectionGroup"
    ALTER COLUMN "sortOrder" TYPE DOUBLE PRECISION;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "RetroReflectionGroup"
    ALTER COLUMN "sortOrder" TYPE INT;
  `)
  await client.end()
}
