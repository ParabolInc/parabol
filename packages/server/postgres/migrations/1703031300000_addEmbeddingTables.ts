import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmbeddingsObjectTypeEnum') THEN
          EXECUTE 'CREATE TYPE "EmbeddingsObjectTypeEnum" AS ENUM (''retrospectiveDiscussionTopic'')';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmbeddingsStateEnum') THEN
          EXECUTE 'CREATE TYPE "EmbeddingsStateEnum" AS ENUM (''queued'', ''embedding'', ''failed'')';
      END IF;

      EXECUTE 'CREATE TABLE IF NOT EXISTS "EmbeddingsMetadata" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "objectType" "EmbeddingsObjectTypeEnum" NOT NULL,
        "refId" VARCHAR(100),
        UNIQUE("objectType", "refId"),
        "refUpdatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "models" VARCHAR(255)[],
        "teamId" VARCHAR(100) NOT NULL,
        "embedText" TEXT
      )';

      DROP TRIGGER IF EXISTS "update_EmbeddingsMetadata_updatedAt" ON "EmbeddingsMetadata";
      CREATE TRIGGER "update_EmbeddingsMetadata_updatedAt" BEFORE UPDATE ON "EmbeddingsMetadata" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsMetadata_objectType" ON "EmbeddingsMetadata"("objectType")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsMetadata_refUpdatedAt" ON "EmbeddingsMetadata"("refUpdatedAt")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsMetadata_models" ON "EmbeddingsMetadata" USING GIN (models)';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsMetadata_teamId" ON "EmbeddingsMetadata"("teamId")';

      EXECUTE 'CREATE TABLE IF NOT EXISTS "EmbeddingsJobQueue" (
          "id" SERIAL PRIMARY KEY,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          "objectType" "EmbeddingsObjectTypeEnum" NOT NULL,
          "refId" VARCHAR(100) NOT NULL,
          "model" VARCHAR(255) NOT NULL,
          UNIQUE("objectType", "refId", "model"),
          "state" "EmbeddingsStateEnum" DEFAULT ''queued'' NOT NULL,
          "stateMessage" TEXT
      )';

      DROP TRIGGER IF EXISTS "update_EmbeddingsJobQueue_updatedAt" ON "EmbeddingsJobQueue";
      CREATE TRIGGER "update_EmbeddingsJobQueue_updatedAt" BEFORE UPDATE ON "EmbeddingsJobQueue" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsJobQueue_objectType" ON "EmbeddingsJobQueue"("objectType")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsJobQueue_refId" ON "EmbeddingsJobQueue"("refId")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsJobQueue_state" ON "EmbeddingsJobQueue"("state")';
  END $$;
  `)
  await client.end()
  try {
    await connectRethinkDB()
    await r
      .table('Organization')
      .indexCreate('featureFlagsIndex', r.row('featureFlags'), {multi: true})
      .run()
    await r.getPoolMaster()?.drain()
  } catch (e) {
    console.log(e)
  }
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  DO $$
  BEGIN
      EXECUTE 'DROP TABLE IF EXISTS "EmbeddingsJobQueue"';
      EXECUTE 'DROP TABLE IF EXISTS "EmbeddingsMetadata"';

      EXECUTE 'DROP TYPE IF EXISTS "EmbeddingsStateEnum" CASCADE';
      EXECUTE 'DROP TYPE IF EXISTS "EmbeddingsObjectTypeEnum" CASCADE';
  END $$;
  `)
  await client.end()
  try {
    await connectRethinkDB()
    await r.table('Organization').indexDrop('featureFlagsIndex').run()
    await r.getPoolMaster()?.drain()
  } catch (e) {
    console.log(e)
  }
}
