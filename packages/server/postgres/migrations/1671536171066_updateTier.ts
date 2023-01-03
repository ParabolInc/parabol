import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TYPE "TierEnum" RENAME VALUE 'personal' TO 'starter';
    ALTER TYPE "TierEnum" RENAME VALUE 'pro' TO 'team';
    `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TYPE "TierEnum" RENAME VALUE 'starter' TO 'personal';
  ALTER TYPE "TierEnum" RENAME VALUE 'team' TO 'pro';
  `)
  await client.end()
}
