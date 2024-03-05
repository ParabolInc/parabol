import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(
    `
    UPDATE "MeetingTemplate"
      SET "isFree" = true
      WHERE "orgId" = 'aGhostOrg'
   `
  )

  await client.end()
}

export async function down() {
  // noop
}
