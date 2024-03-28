import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  // wipe data to ensure the non-null constraints succeed
  await client.query(`
    CREATE TYPE "ISO6391Enum" AS ENUM ('aa', 'ab', 'af', 'ak', 'am', 'ar', 'an', 'as', 'av', 'ae', 'ay', 'az', 'ba', 'bm', 'be', 'bn', 'bi', 'bo', 'bs', 'br', 'bg', 'ca', 'cs', 'ch', 'ce', 'cu', 'cv', 'kw', 'co', 'cr', 'cy', 'da', 'de', 'dv', 'dz', 'el', 'en', 'eo', 'et', 'eu', 'ee', 'fo', 'fa', 'fj', 'fi', 'fr', 'fy', 'ff', 'gd', 'ga', 'gl', 'gv', 'gn', 'gu', 'ht', 'ha', 'sh', 'he', 'hz', 'hi', 'ho', 'hr', 'hu', 'hy', 'ig', 'io', 'ii', 'iu', 'ie', 'ia', 'id', 'ik', 'is', 'it', 'jv', 'ja', 'kl', 'kn', 'ks', 'ka', 'kr', 'kk', 'km', 'ki', 'rw', 'ky', 'kv', 'kg', 'ko', 'kj', 'ku', 'lo', 'la', 'lv', 'li', 'ln', 'lt', 'lb', 'lu', 'lg', 'mh', 'ml', 'mr', 'mk', 'mg', 'mt', 'mn', 'mi', 'ms', 'my', 'na', 'nv', 'nr', 'nd', 'ng', 'ne', 'nl', 'nn', 'nb', 'no', 'ny', 'oc', 'oj', 'or', 'om', 'os', 'pa', 'pi', 'pl', 'pt', 'ps', 'qu', 'rm', 'ro', 'rn', 'ru', 'sg', 'sa', 'si', 'sk', 'sl', 'se', 'sm', 'sn', 'sd', 'so', 'st', 'es', 'sq', 'sc', 'sr', 'ss', 'su', 'sw', 'sv', 'ty', 'ta', 'tt', 'te', 'tg', 'tl', 'th', 'ti', 'to', 'tn', 'ts', 'tk', 'tr', 'tw', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'wo', 'xh', 'yi', 'yo', 'za', 'zh', 'zu');
    DELETE FROM "EmbeddingsMetadata";
    DELETE FROM "EmbeddingsJobQueue";
    CREATE INDEX IF NOT EXISTS "idx_Discussion_createdAt" ON "Discussion"("createdAt");
    ALTER TYPE "EmbeddingsStateEnum" RENAME VALUE 'embedding' TO 'running';
    ALTER TYPE "EmbeddingsStateEnum" RENAME TO "EmbeddingsJobStateEnum";
    ALTER TABLE "EmbeddingsMetadata"
      DROP COLUMN "models",
      ADD COLUMN "language" "ISO6391Enum",
      ALTER COLUMN "refId" SET NOT NULL;
    ALTER TABLE "EmbeddingsJobQueue"
      ADD COLUMN "retryAfter" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN "retryCount" SMALLINT NOT NULL DEFAULT 0,
      ADD COLUMN "startAt" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN "priority" SMALLINT NOT NULL DEFAULT 50,
      ADD COLUMN "jobData" JSONB NOT NULL DEFAULT '{}',
      ADD COLUMN "jobType" VARCHAR(255) NOT NULL,
      DROP CONSTRAINT IF EXISTS "EmbeddingsJobQueue_objectType_refId_model_key",
      DROP COLUMN "refId",
      DROP COLUMN "objectType",
      DROP COLUMN "model";
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsJobQueue_priority" ON "EmbeddingsJobQueue"("priority");
    `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TYPE IF EXISTS "ISO6391Enum" CASCADE;
    DROP INDEX IF EXISTS "idx_Discussion_createdAt";
    ALTER TYPE "EmbeddingsJobStateEnum" RENAME VALUE 'running' TO 'embedding';
    ALTER TYPE "EmbeddingsJobStateEnum" RENAME TO "EmbeddingsStateEnum";
    ALTER TABLE "EmbeddingsMetadata"
      ADD COLUMN "models" VARCHAR(255)[],
      DROP COLUMN IF EXISTS "language",
      ALTER COLUMN "refId" DROP NOT NULL;
    ALTER TABLE "EmbeddingsJobQueue"
      ALTER COLUMN "state" TYPE "EmbeddingsStateEnum" USING "state"::text::"EmbeddingsStateEnum",
      ADD CONSTRAINT "EmbeddingsJobQueue_objectType_refId_model_key" UNIQUE("objectType", "refId", "model"),
      ADD COLUMN "refId" VARCHAR(100),
      ADD COLUMN "model" VARCHAR(255),
      ADD COLUMN "objectType" "EmbeddingsObjectTypeEnum",
      DROP COLUMN "retryAfter",
      DROP COLUMN "retryCount",
      DROP COLUMN "startAt",
      DROP COLUMN "jobData",
      DROP COLUMN "priority",
      DROP COLUMN "jobType";
    DROP INDEX IF EXISTS "idx_EmbeddingsJobQueue_priority";
  `)
  await client.end()
}
