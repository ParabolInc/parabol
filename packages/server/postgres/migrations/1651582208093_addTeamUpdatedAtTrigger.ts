import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_Team_updatedAt" ON "Team";
    CREATE TRIGGER "update_Team_updatedAt" BEFORE UPDATE ON "Team" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DROP TRIGGER IF EXISTS "update_Team_updatedAt" ON "Team";`)
  await client.end()
}
