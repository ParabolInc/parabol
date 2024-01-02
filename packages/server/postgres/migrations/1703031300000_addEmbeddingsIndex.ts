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
          EXECUTE 'CREATE TYPE "EmbeddingsStateEnum" AS ENUM (''new'', ''queued'', ''embedding'', ''embedded'')';
      END IF;

      EXECUTE 'CREATE TABLE IF NOT EXISTS "EmbeddingsIndex" (
        "id" SERIAL PRIMARY KEY,
        "objectType" "EmbeddingsObjectTypeEnum" NOT NULL,
        "refTable" VARCHAR(100),
        "refId" VARCHAR(100),
        UNIQUE("objectType", "refTable", "refId"),
        "refDateTime" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "state" "EmbeddingsStateEnum" DEFAULT ''new'',
        "stateMessage" TEXT,
        "stateUpdatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "models" TEXT[],
        "teamId" VARCHAR(100) NOT NULL,
        "orgId" VARCHAR(100) NOT NULL,
        "embedText" TEXT
      )';

      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_objectType" ON "EmbeddingsIndex"("objectType")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_refTable" ON "EmbeddingsIndex"("refTable")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_refDateTime" ON "EmbeddingsIndex"("refDateTime")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_state" ON "EmbeddingsIndex"("state")';
      EXECUTE 'CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_stateUpdatedAt" ON "EmbeddingsIndex"("stateUpdatedAt")';
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

      -- Dropping indexes and tables
      EXECUTE 'DROP INDEX IF EXISTS idx_EmbeddingsIndex_objectType';
      EXECUTE 'DROP INDEX IF EXISTS idx_EmbeddingsIndex_refTable';
      EXECUTE 'DROP INDEX IF EXISTS idx_EmbeddingsIndex_refDate';
      EXECUTE 'DROP INDEX IF EXISTS idx_EmbeddingsIndex_state';
      EXECUTE 'DROP INDEX IF EXISTS idx_EmbeddingsIndex_stateUpdatedAt';
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
