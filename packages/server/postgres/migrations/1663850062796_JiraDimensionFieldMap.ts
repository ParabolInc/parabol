import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  CREATE TABLE IF NOT EXISTS "JiraDimensionFieldMap" (
    "id" SERIAL,
    "teamId" VARCHAR(120) NOT NULL,
    "cloudId" VARCHAR(120) NOT NULL,
    "projectKey" VARCHAR(120) NOT NULL,
    "issueType" VARCHAR(120) NOT NULL,
    "dimensionName" VARCHAR(120) NOT NULL,
    "fieldId" VARCHAR(120) NOT NULL,
    "fieldName" VARCHAR(120) NOT NULL,
    "fieldType" VARCHAR(120) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY ("teamId", "cloudId", "projectKey", "issueType", "dimensionName")
  );
  CREATE TRIGGER "update_JiraDimensionFieldMap_updatedAt" BEFORE UPDATE ON "JiraDimensionFieldMap" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();

  INSERT INTO "JiraDimensionFieldMap" ("teamId", "cloudId", "projectKey", "issueType", "dimensionName", "fieldId", "fieldName", "fieldType")
    SELECT "Team"."id", jdf->>'cloudId', jdf->>'projectKey', '', jdf->>'dimensionName', jdf->>'fieldId', jdf->>'fieldName', jdf->>'fieldType'
    FROM "Team", unnest("jiraDimensionFields") as jdf WHERE "jiraDimensionFields" != '{}'
    ON CONFLICT ("teamId", "cloudId", "projectKey", "issueType", "dimensionName") DO NOTHING;
  `)
  // not dropping column yet to have an easy down migration
  /* ALTER TABLE "Team"
    DROP COLUMN IF EXISTS "jiraDimensionFields",
  */

  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()

  // imagine an elaborate down migration here which aggregates the values back into a jsonb[] column and then imagine Postgres adding escape characters during array_agg rendering this useless
  /*
  ALTER TABLE "Team"
    ADD COLUMN IF NOT EXISTS "jiraDimensionFields" JSONB[] NOT NULL DEFAULT '{}';

  UPDATE "Team"
    SET "jiraDimensionFields"=jdf.agg
    FROM "Team" as t
    INNER JOIN
      (SELECT "teamId", array_agg(jsonb_build_object('cloudId', "cloudId", 'projectKey', "projectKey", 'dimensionName', "dimensionName", 'fieldId', "fieldId", 'fieldName', "fieldName", 'fieldType', "fieldType")) AS agg
        FROM "JiraDimensionFieldMap"
        GROUP BY "teamId") AS jdf
    ON t.id = jdf."teamId";
  */
  await client.query(`
  DROP TABLE IF EXISTS "JiraDimensionFieldMap";
  DROP TRIGGER IF EXISTS "update_JiraDimensionFieldMap_updatedAt" ON "JiraDimensionFieldMap";
  `)
  await client.end()
}
