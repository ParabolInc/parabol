import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`UPDATE "MeetingTemplate" SET "isActive" = false WHERE id = 'oneOnOneAction';`)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`UPDATE "MeetingTemplate" SET "isActive" = true WHERE id = 'oneOnOneAction';`)
  await client.end()
}
