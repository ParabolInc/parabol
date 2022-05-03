import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_IntegrationProvider_updatedAt" ON "IntegrationProvider";
    CREATE TRIGGER "update_IntegrationProvider_updatedAt" BEFORE UPDATE ON "IntegrationProvider" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `DROP TRIGGER IF EXISTS "update_IntegrationProvider_updatedAt" ON "IntegrationProvider";`
  )
  await client.end()
}
