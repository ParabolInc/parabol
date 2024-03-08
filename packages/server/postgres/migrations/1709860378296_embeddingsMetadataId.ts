import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "EmbeddingsMetadata"
      DROP COLUMN "models",
      ALTER COLUMN "refId" SET NOT NULL;
    ALTER TABLE "EmbeddingsJobQueue"
      DROP CONSTRAINT IF EXISTS "EmbeddingsJobQueue_objectType_refId_model_key",
      DROP COLUMN "refId",
      DROP COLUMN "objectType",
      ADD COLUMN "embeddingsMetadataId" INTEGER NOT NULL,
      ADD CONSTRAINT "EmbeddingsMetadata_embeddingsMetadataId_fkey"
        FOREIGN KEY ("embeddingsMetadataId")
          REFERENCES "EmbeddingsMetadata" ("id")
          ON DELETE CASCADE,
      ADD CONSTRAINT "EmbeddingsJobQueue_embeddingsMetadataId_model_unique" UNIQUE ("embeddingsMetadataId", "model");
    `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    ALTER TABLE "EmbeddingsMetadata"
      ADD COLUMN "models" VARCHAR(255)[],
      ALTER COLUMN "refId" DROP NOT NULL;
    ALTER TABLE "EmbeddingsJobQueue"
      ADD CONSTRAINT "EmbeddingsJobQueue_objectType_refId_model_key" UNIQUE("objectType", "refId", "model"),
      ADD COLUMN "refId" VARCHAR(100),
      ADD COLUMN "objectType" "EmbeddingsObjectTypeEnum" NOT NULL,
      DROP COLUMN "embeddingsMetadataId",
      DROP CONSTRAINT IF EXISTS "EmbeddingsMetadata_embeddingsMetadataId_fkey",
      DROP CONSTRAINT IF EXISTS "EmbeddingsJobQueue_embeddingsMetadataId_model_unique";
  `)
  await client.end()
}
