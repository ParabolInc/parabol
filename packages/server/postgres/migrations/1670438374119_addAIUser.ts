import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  const picture = 'https://action-files.parabol.co/static/favicon.ico'

  const id = 'parabolAIUser'
  const email = 'ai-user@parabol.co'
  const preferredName = 'Parabol AI'
  await client.query(`
    INSERT INTO "User" ("id", "email", "preferredName", "picture") VALUES ('${id}', '${email}', '${preferredName}', '${picture}');
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DELETE FROM "User" WHERE "id" = 'parabolAIUser';
  `)
  await client.end()
}
