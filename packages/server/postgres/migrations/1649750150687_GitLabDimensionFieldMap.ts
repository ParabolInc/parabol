import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  CREATE TABLE IF NOT EXISTS "GitLabDimensionFieldMap" (
    "id" SERIAL UNIQUE,
    "teamId" VARCHAR(100) NOT NULL,
    "dimensionName" VARCHAR(120) NOT NULL,
    "projectId" INT NOT NULL,
    "providerId" INT NOT NULL,
    "labelTemplate" VARCHAR(100) NOT NULL,
    PRIMARY KEY ("teamId", "dimensionName", "projectId", "providerId")
  );
  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE IF EXISTS "GitLabDimensionFieldMap";
  `)
  await client.end()
}
