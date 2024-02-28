import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "EmbeddingsMetadata" RENAME COLUMN "embedText" TO "fullText";
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "EmbeddingsMetadata" RENAME COLUMN "fullText" TO "embedText";
  `)
  await client.end()
}
