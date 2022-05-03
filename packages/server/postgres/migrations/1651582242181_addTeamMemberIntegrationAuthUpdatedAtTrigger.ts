import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_TeamMemberIntegrationAuth_updatedAt" ON "TeamMemberIntegrationAuth";
    CREATE TRIGGER "update_TeamMemberIntegrationAuth_updatedAt" BEFORE UPDATE ON "TeamMemberIntegrationAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `DROP TRIGGER IF EXISTS "update_TeamMemberIntegrationAuth_updatedAt" ON "TeamMemberIntegrationAuth";`
  )
  await client.end()
}
