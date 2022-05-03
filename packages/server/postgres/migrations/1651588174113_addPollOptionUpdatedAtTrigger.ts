import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_PollOption_updatedAt" ON "PollOption";
    CREATE TRIGGER "update_PollOption_updatedAt" BEFORE UPDATE ON "PollOption" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DROP TRIGGER IF EXISTS "update_PollOption_updatedAt" ON "PollOption";`)
  await client.end()
}
