import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "TeamPromptResponse" ADD CONSTRAINT "TeamPromptResponse_meetingIdUserId_unique" UNIQUE ("meetingId", "userId");
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "TeamPromptResponse" DROP CONSTRAINT "TeamPromptResponse_meetingIdUserId_unique";
  `)
  await client.end()
}
