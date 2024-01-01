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
      CREATE TYPE "EmbeddingsObjectTypeEnum" AS ENUM (
        'retrospectiveDiscussionTopic'
      );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmbeddingsStateEnum') THEN
      CREATE TYPE "EmbeddingsStateEnum" AS ENUM (
        'new',
        'queued',
        'embedding',
        'embedded',
      );
    END IF;
    CREATE TABLE IF NOT EXISTS "EmbeddingsIndex" (
      "id" SERIAL PRIMARY KEY,
      "objectType" "EmbeddingsObjectTypeEnum" NOT NULL,
      "refTable" VARCHAR(100),
      "refId" VARCHAR(100),
      UNIQUE("objectType", "refTable", "refId"),
      "refDateTime" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "state" "EmbeddingsStateEnum" DEFAULT 'new',
      "stateMessage" TEXT,
      "stateUpdatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "models" TEXT[],
      "teamId" VARCHAR(100) NOT NULL,
      "orgId" VARCHAR(100) NOT NULL,
      "embedText" TEXT
    );
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_objectType" ON "EmbeddingsIndex"("objectType");
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_refTable" ON "EmbeddingsIndex"("refTable");
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_refDateTime" ON "EmbeddingsIndex"("refDateTime");
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_state" ON "EmbeddingsIndex"("state");
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_stateUpdatedAt" ON "EmbeddingsIndex"("stateUpdatedAt")
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_models" ON "EmbeddingsIndex" USING GIN (models);
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_teamId" ON "EmbeddingsIndex"("teamId");
    CREATE INDEX IF NOT EXISTS "idx_EmbeddingsIndex_orgId" ON "EmbeddingsIndex"("orgId");
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
      DROP INDEX IF EXISTS "idx_EmbeddingsIndex_objectType";
      DROP INDEX IF EXISTS "idx_EmbeddingsIndex_refTable";
      DROP INDEX IF EXISTS "idx_EmbeddingsIndex_refDate";
      DROP INDEX IF EXISTS "idx_EmbeddingsIndex_state";
      DROP INDEX IF EXISTS "idx_EmbeddingsIndex_stateUpdatedAt";
      DROP INDEX IF EXISTS "idx_EmbeddingsIndex_models";
      DROP INDEX IF EXISTS "idx_EmbeddingsIndex_teamId";
      DROP INDEX IF EXISTS "idx_EmbeddingsIndex_orgId";
      DROP TABLE IF EXISTS "EmbeddingsIndex";
      DROP TYPE IF EXISTS "EmbeddingsStateEnum";
      DROP TYPE IF EXISTS "EmbeddingsObjectTypeEnum";
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
