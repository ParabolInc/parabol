import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  CREATE TABLE IF NOT EXISTS "JiraServerDimensionFieldMap" (
    "id" SERIAL UNIQUE,
    "providerId" INTEGER NOT NULL,
    "teamId" VARCHAR(120) NOT NULL,
    "dimensionName" VARCHAR(120) NOT NULL,
    "projectId" VARCHAR(120) NOT NULL,
    "issueType" VARCHAR(120) NOT NULL,
    "fieldId" VARCHAR(120) NOT NULL,
    "fieldName" VARCHAR(120) NOT NULL,
    "fieldType" VARCHAR(120) NOT NULL,
    PRIMARY KEY ("providerId", "teamId", "projectId", "issueType", "dimensionName")
  );
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "JiraServerDimensionFieldMap";
  `)
  await client.end()
}
