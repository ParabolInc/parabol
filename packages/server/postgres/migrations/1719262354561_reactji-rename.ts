import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()

  await client.query(`
    ALTER TYPE "Reactji" RENAME ATTRIBUTE "userid" to "userId";
    ALTER TYPE "Reactji" RENAME ATTRIBUTE "shortname" to "id";
    `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`` /* Do undo magic */)
  await client.end()
}
