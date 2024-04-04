import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "EmbeddingsJobQueue"
      ALTER COLUMN "priority" TYPE INTEGER,
      ADD COLUMN "flowId" INTEGER;
    CREATE SEQUENCE IF NOT EXISTS "EmbeddingsJobQueue_flowId_seq" AS INTEGER CYCLE OWNED BY "EmbeddingsJobQueue"."flowId";
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsJobQueue_flowId" ON "EmbeddingsJobQueue" ("flowId");
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "EmbeddingsJobQueue"
      ALTER COLUMN "priority" TYPE SMALLINT,
      DROP COLUMN IF EXISTS "flowId";
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsJobQueue_priority" ON "EmbeddingsJobQueue" ("priority");
    DROP INDEX IF EXISTS "idx_EmbeddingsJobQueue_priority_flowStartAt";
  ` /* Do undo magic */)
  await client.end()
}
