import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "EmbeddingsJobQueue"
      ALTER COLUMN "priority" TYPE INTEGER;
    ALTER TABLE "EmbeddingsJobQueue"
      ADD COLUMN "model" VARCHAR(255),
      ADD COLUMN "embeddingsMetadataId" INTEGER,
      ADD CONSTRAINT "fk_embeddingsMetadataId"
        FOREIGN KEY("embeddingsMetadataId")
          REFERENCES "EmbeddingsMetadata"("id")
          ON DELETE SET NULL;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DELETE FROM "EmbeddingsJobQueue";
    ALTER TABLE "EmbeddingsJobQueue"
      ALTER COLUMN "priority" TYPE SMALLINT,
      DROP COLUMN IF EXISTS "model",
      DROP COLUMN IF EXISTS "embeddingsMetadataId";
  ` /* Do undo magic */)
  await client.end()
}
