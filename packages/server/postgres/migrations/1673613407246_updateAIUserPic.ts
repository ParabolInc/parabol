import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()

  const picture = 'https://action-files.parabol.co/static/favicon-with-more-padding.jpeg'
  await client.query(`
    UPDATE "User" SET "picture" = '${picture}' WHERE "id" = 'parabolAIUser';
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  const oldPicture = 'https://action-files.parabol.co/static/favicon.ico'
  await client.query(`
    UPDATE "User" SET "picture" = '${oldPicture}' WHERE "id" = 'parabolAIUser';
  `)
  await client.end()
}
