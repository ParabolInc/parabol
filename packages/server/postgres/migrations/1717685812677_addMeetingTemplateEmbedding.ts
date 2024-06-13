import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    ALTER TYPE "EmbeddingsObjectTypeEnum" ADD VALUE IF NOT EXISTS 'meetingTemplate';
  END $$;
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
    DELETE FROM "EmbeddingsMetadata" WHERE "objectType" = 'meetingTemplate';

    ALTER TYPE "EmbeddingsObjectTypeEnum" RENAME TO "EmbeddingsObjectTypeEnum_delete";

    CREATE TYPE "EmbeddingsObjectTypeEnum" AS ENUM (
      'retrospectiveDiscussionTopic'
    );

    ALTER TABLE "EmbeddingsMetadata"
      ALTER COLUMN "objectType" TYPE "EmbeddingsObjectTypeEnum" USING "objectType"::text::"EmbeddingsObjectTypeEnum";

    DROP TYPE "EmbeddingsObjectTypeEnum_delete";
  END $$;
  `)
  await client.end()
}
