import {Client} from 'pg'
import getPgConfig from '../getPgConfig'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

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

      EXECUTE 'CREATE TABLE IF NOT EXISTS "EmbeddingsJobQueue" (
          "id" SERIAL PRIMARY KEY,
          "objectType" "EmbeddingsObjectTypeEnum" NOT NULL,
          "refId" VARCHAR(100) NOT NULL,
          "model" TEXT NOT NULL,
          UNIQUE("objectType", "refId", "model"),
          "state" "EmbeddingsStateEnum" DEFAULT ''queued'' NOT NULL,
          "stateMessage" TEXT,
          "stateUpdatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )';

      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsJobQueue_objectType" ON "EmbeddingsJobQueue"("objectType")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsJobQueue_refId" ON "EmbeddingsJobQueue"("refId")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsJobQueue_state" ON "EmbeddingsJobQueue"("state")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsJobQueue_stateUpdatedAt" ON "EmbeddingsJobQueue"("stateUpdatedAt")';

      EXECUTE 'CREATE TABLE IF NOT EXISTS "EmbeddingsIndex" (
        "id" SERIAL PRIMARY KEY,
        "objectType" "EmbeddingsObjectTypeEnum" NOT NULL,
        "refId" VARCHAR(100),
        UNIQUE("objectType", "refId"),
        "refDateTime" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "models" TEXT[],
        "teamId" VARCHAR(100) NOT NULL,
        "orgId" VARCHAR(100) NOT NULL,
        "embedText" TEXT
      )';

      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_objectType" ON "EmbeddingsIndex"("objectType")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_refDateTime" ON "EmbeddingsIndex"("refDateTime")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_models" ON "EmbeddingsIndex" USING GIN (models)';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_teamId" ON "EmbeddingsIndex"("teamId")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_orgId" ON "EmbeddingsIndex"("orgId")';
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
  DECLARE
      r RECORD;
  BEGIN
      FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'Embeddings_%'
      LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;

      EXECUTE 'DROP INDEX IF EXISTS "idx_EmbeddingsJobQueue_objectType"';
      EXECUTE 'DROP INDEX IF EXISTS "idx_EmbeddingsJobQueue_refId"';
      EXECUTE 'DROP INDEX IF EXISTS "idx_EmbeddingsJobQueue_state"';
      EXECUTE 'DROP INDEX IF EXISTS "idx_EmbeddingsJobQueue_stateUpdatedAt"';

      EXECUTE 'DROP TABLE IF EXISTS "EmbeddingsJobQueue"';

      EXECUTE 'DROP INDEX IF EXISTS idx_EmbeddingsIndex_objectType';
      EXECUTE 'DROP INDEX IF EXISTS idx_EmbeddingsIndex_refDate';
      EXECUTE 'DROP INDEX IF EXISTS idx_EmbeddingsIndex_models';
      EXECUTE 'DROP INDEX IF EXISTS idx_EmbeddingsIndex_teamId';
      EXECUTE 'DROP INDEX IF EXISTS idx_EmbeddingsIndex_orgId';

      EXECUTE 'DROP TABLE IF EXISTS EmbeddingsIndex';

      EXECUTE 'DROP TYPE IF EXISTS EmbeddingsStateEnum';
      EXECUTE 'DROP TYPE IF EXISTS EmbeddingsObjectTypeEnum';
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
