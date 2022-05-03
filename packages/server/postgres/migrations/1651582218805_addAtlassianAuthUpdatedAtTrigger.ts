import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_AtlassianAuth_updatedAt" ON "AtlassianAuth";
    CREATE TRIGGER "update_AtlassianAuth_updatedAt" BEFORE UPDATE ON "AtlassianAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DROP TRIGGER IF EXISTS "update_AtlassianAuth_updatedAt" ON "AtlassianAuth";`)
  await client.end()
}
