import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "User"
    RENAME COLUMN "segmentId" TO "pseudoId";
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "User"
    RENAME COLUMN "pseudoId" TO "segmentId";
  `)
  await client.end()
}
