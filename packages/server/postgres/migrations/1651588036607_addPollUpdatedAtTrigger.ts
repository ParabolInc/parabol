import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_Poll_updatedAt" ON "Poll";
    CREATE TRIGGER "update_Poll_updatedAt" BEFORE UPDATE ON "Poll" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DROP TRIGGER IF EXISTS "update_Poll_updatedAt" ON "Poll";`)
  await client.end()
}
