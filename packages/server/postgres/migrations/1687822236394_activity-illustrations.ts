import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  // I messed up & forgot to add the "/template" part of the URL in the last migration
  await client.query(`
  UPDATE "MeetingTemplate"
  SET "illustrationUrl" = REPLACE("illustrationUrl", '/aGhostOrg/', '/aGhostOrg/template/')
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`` /* Do undo magic */)
  await client.end()
}
