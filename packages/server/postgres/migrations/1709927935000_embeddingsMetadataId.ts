import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  // wipe data to ensure the non-null constraints succeed
  await client.query(`
    DELETE FROM "EmbeddingsMetadata";
    DELETE FROM "EmbeddingsJobQueue";
    CREATE INDEX IF NOT EXISTS "idx_Discussion_createdAt" ON "Discussion"("createdAt");
    ALTER TABLE "EmbeddingsMetadata"
      DROP COLUMN "models",
      ALTER COLUMN "refId" SET NOT NULL;
    ALTER TABLE "EmbeddingsJobQueue"
      ADD COLUMN "retryAfter" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN "retryCount" SMALLINT NOT NULL DEFAULT 0,
      ADD COLUMN "startAt" TIMESTAMP WITH TIME ZONE,
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
    DROP INDEX IF EXISTS "idx_Discussion_createdAt";
    ALTER TABLE "EmbeddingsMetadata"
      ADD COLUMN "models" VARCHAR(255)[],
      ALTER COLUMN "refId" DROP NOT NULL;
    ALTER TABLE "EmbeddingsJobQueue"
      ADD CONSTRAINT "EmbeddingsJobQueue_objectType_refId_model_key" UNIQUE("objectType", "refId", "model"),
      ADD COLUMN "refId" VARCHAR(100),
      ADD COLUMN "objectType" "EmbeddingsObjectTypeEnum",
      DROP COLUMN "embeddingsMetadataId",
      DROP COLUMN "retryAfter",
      DROP COLUMN "retryCount",
      DROP COLUMN "startAt",
      DROP CONSTRAINT IF EXISTS "EmbeddingsMetadata_embeddingsMetadataId_fkey",
      DROP CONSTRAINT IF EXISTS "EmbeddingsJobQueue_embeddingsMetadataId_model_unique";
  `)
  await client.end()
}
