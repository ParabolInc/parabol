import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "MattermostAuth";
  `)
  await client.end()
}

export async function down() {
  // No undo magic, table was migrated some time ago in https://github.com/ParabolInc/parabol/pull/5829
}
