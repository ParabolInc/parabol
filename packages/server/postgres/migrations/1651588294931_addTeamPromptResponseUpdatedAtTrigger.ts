import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_TeamPromptResponse_updatedAt" ON "TeamPromptResponse";
    CREATE TRIGGER "update_TeamPromptResponse_updatedAt" BEFORE UPDATE ON "TeamPromptResponse" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `DROP TRIGGER IF EXISTS "update_TeamPromptResponse_updatedAt" ON "TeamPromptResponse";`
  )
  await client.end()
}
