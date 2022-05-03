import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TRIGGER IF EXISTS "update_GitHubAuth_updatedAt" ON "GitHubAuth";
    CREATE TRIGGER "update_GitHubAuth_updatedAt" BEFORE UPDATE ON "GitHubAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DROP TRIGGER IF EXISTS "update_GitHubAuth_updatedAt" ON "GitHubAuth";`)
  await client.end()
}
