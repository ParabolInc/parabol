import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS "IntegrationDimensionFieldMap" (
      id serial PRIMARY KEY,
      "teamId" varchar(120) NOT NULL REFERENCES "Team"(id) ON DELETE CASCADE,
      service "IntegrationProviderServiceEnum" NOT NULL,
      "repoId" varchar(255) NOT NULL,
      "workItemType" varchar(255) NOT NULL DEFAULT '',
      "dimensionName" varchar(120) NOT NULL,
      "fieldId" varchar(120) NOT NULL,
      "fieldName" varchar(140) NOT NULL,
      "fieldType" varchar(120) NOT NULL,
      "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "IntegrationDimensionFieldMap_key" UNIQUE ("teamId", service, "repoId", "workItemType", "dimensionName")
    )
  `.execute(db)
  await sql`
    DROP TRIGGER IF EXISTS "update_IntegrationDimensionFieldMap_updatedAt" ON "IntegrationDimensionFieldMap";
    CREATE TRIGGER "update_IntegrationDimensionFieldMap_updatedAt"
      BEFORE UPDATE ON "IntegrationDimensionFieldMap"
      FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"()
  `.execute(db)

  const columns = sql`("teamId", service, "repoId", "workItemType", "dimensionName", "fieldId", "fieldName", "fieldType", "updatedAt")`
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'jira', m."cloudId" || ':' || m."projectKey", m."issueType", m."dimensionName", m."fieldId", m."fieldName", m."fieldType", m."updatedAt"
    FROM "JiraDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    ON CONFLICT DO NOTHING
  `.execute(db)
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'jiraServer', m."providerId" || ':' || m."projectId", m."issueType", m."dimensionName", m."fieldId", m."fieldName", m."fieldType", CURRENT_TIMESTAMP
    FROM "JiraServerDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    ON CONFLICT DO NOTHING
  `.execute(db)
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'azureDevOps', m."instanceId" || ':' || m."projectKey", m."workItemType", m."dimensionName", m."fieldId", m."fieldName", m."fieldType", CURRENT_TIMESTAMP
    FROM "AzureDevOpsDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    ON CONFLICT DO NOTHING
  `.execute(db)
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'github', m."nameWithOwner", '', m."dimensionName", m."labelTemplate", m."labelTemplate", 'string', CURRENT_TIMESTAMP
    FROM "GitHubDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    ON CONFLICT DO NOTHING
  `.execute(db)
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'gitlab', m."providerId" || ':' || m."projectId", '', m."dimensionName", m."labelTemplate", m."labelTemplate", 'string', CURRENT_TIMESTAMP
    FROM "GitLabDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    ON CONFLICT DO NOTHING
  `.execute(db)
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'linear', m."repoId", '', m."dimensionName", m."labelTemplate", m."labelTemplate", 'string', CURRENT_TIMESTAMP
    FROM "LinearDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    WHERE m."labelTemplate" IS NOT NULL
    ON CONFLICT DO NOTHING
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // The six legacy tables are untouched by up(), so the copied rows are disposable.
  // Mappings changed AFTER this migration exist only here and are lost.
  await sql`DROP TABLE IF EXISTS "IntegrationDimensionFieldMap"`.execute(db)
}
