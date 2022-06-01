import {Client} from 'pg'
import getPgConfig from '../getPgConfig'
export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  CREATE TABLE IF NOT EXISTS "AzureDevOpsDimensionFieldMap" (
    "id" SERIAL UNIQUE,
    "teamId" VARCHAR(120) NOT NULL,
    "dimensionName" VARCHAR(120) NOT NULL,
    "fieldName" VARCHAR(140) NOT NULL,
    "fieldId" VARCHAR(100) NOT NULL,
    "instanceId" VARCHAR(100) NOT NULL,
    "fieldType" VARCHAR(100) NOT NULL,
    "projectKey" VARCHAR(100) NOT NULL,
    PRIMARY KEY ("teamId", "dimensionName", "instanceId", "projectKey")
  );
  `)
  await client.end()
}
export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "AzureDevOpsDimensionFieldMap";
  `)
  await client.end()
}
