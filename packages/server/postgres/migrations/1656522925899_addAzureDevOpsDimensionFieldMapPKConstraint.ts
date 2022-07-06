import {Client} from 'pg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "AzureDevOpsDimensionFieldMap"
  DROP CONSTRAINT "AzureDevOpsDimensionFieldMap_pkey";

  ALTER TABLE "AzureDevOpsDimensionFieldMap"
  ADD CONSTRAINT AzureDevOpsDimensionFieldMap_pkey PRIMARY KEY ("teamId", "dimensionName", "instanceId", "projectKey", "workItemType");

  `)
  await client.end()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
  ALTER TABLE "AzureDevOpsDimensionFieldMap"
  DROP CONSTRAINT "AzureDevOpsDimensionFieldMap_pkey";

  ALTER TABLE "AzureDevOpsDimensionFieldMap"
  ADD CONSTRAINT AzureDevOpsDimensionFieldMap_pkey PRIMARY KEY ("teamId", "dimensionName", "instanceId", "projectKey");
  `)
  await client.end()
}
