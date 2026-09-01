import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS "IntegrationDimensionFieldMap" (
      id serial PRIMARY KEY,
      "teamId" varchar(100) NOT NULL REFERENCES "Team"(id) ON DELETE CASCADE,
      service "IntegrationProviderServiceEnum" NOT NULL,
      "repoId" varchar(255) NOT NULL,
      "issueType" varchar(255),
      "dimensionName" varchar(120) NOT NULL,
      "fieldId" varchar(120) NOT NULL,
      "fieldName" varchar(140),
      "fieldType" varchar(120) NOT NULL,
      "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "IntegrationDimensionFieldMap_key" UNIQUE NULLS NOT DISTINCT ("teamId", service, "repoId", "issueType", "dimensionName")
    )
  `.execute(db)
  await sql`
    DROP TRIGGER IF EXISTS "update_IntegrationDimensionFieldMap_updatedAt" ON "IntegrationDimensionFieldMap";
    CREATE TRIGGER "update_IntegrationDimensionFieldMap_updatedAt"
      BEFORE UPDATE ON "IntegrationDimensionFieldMap"
      FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"()
  `.execute(db)

  const columns = sql`("teamId", service, "repoId", "issueType", "dimensionName", "fieldId", "fieldName", "fieldType", "updatedAt")`
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'jira', m."cloudId" || ':' || m."projectKey", NULLIF(m."issueType", ''), m."dimensionName", m."fieldId", NULLIF(m."fieldName", m."fieldId"), m."fieldType", m."updatedAt"
    FROM "JiraDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    ON CONFLICT DO NOTHING
  `.execute(db)
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'jiraServer', m."providerId" || ':' || m."projectId", NULLIF(m."issueType", ''), m."dimensionName", m."fieldId", NULLIF(m."fieldName", m."fieldId"), m."fieldType", CURRENT_TIMESTAMP
    FROM "JiraServerDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    ON CONFLICT DO NOTHING
  `.execute(db)
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'azureDevOps', m."instanceId" || ':' || m."projectKey", NULLIF(m."workItemType", ''), m."dimensionName", m."fieldId", NULLIF(m."fieldName", m."fieldId"), m."fieldType", CURRENT_TIMESTAMP
    FROM "AzureDevOpsDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    ON CONFLICT DO NOTHING
  `.execute(db)
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'github', m."nameWithOwner", NULL, m."dimensionName", m."labelTemplate", NULL, 'string', CURRENT_TIMESTAMP
    FROM "GitHubDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    ON CONFLICT DO NOTHING
  `.execute(db)
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'gitlab', m."providerId" || ':' || m."projectId", NULL, m."dimensionName", m."labelTemplate", NULL, 'string', CURRENT_TIMESTAMP
    FROM "GitLabDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    ON CONFLICT DO NOTHING
  `.execute(db)
  await sql`
    INSERT INTO "IntegrationDimensionFieldMap" ${columns}
    SELECT m."teamId", 'linear', m."repoId", NULL, m."dimensionName", m."labelTemplate", NULL, 'string', CURRENT_TIMESTAMP
    FROM "LinearDimensionFieldMap" m JOIN "Team" t ON t.id = m."teamId"
    WHERE m."labelTemplate" IS NOT NULL
    ON CONFLICT DO NOTHING
  `.execute(db)

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EstimatePushTargetEnum') THEN
        CREATE TYPE "EstimatePushTargetEnum" AS ENUM ('comment', 'field', 'label');
      END IF;
    END $$
  `.execute(db)
  await sql`
    ALTER TABLE "TaskEstimate"
      ADD COLUMN IF NOT EXISTS "pushService" "IntegrationProviderServiceEnum",
      ADD COLUMN IF NOT EXISTS "pushTarget" "EstimatePushTargetEnum",
      ADD COLUMN IF NOT EXISTS "pushTargetId" varchar(255)
  `.execute(db)
  await sql`
    ALTER TABLE "TaskEstimate" DROP CONSTRAINT IF EXISTS "TaskEstimate_push_all_or_none";
    ALTER TABLE "TaskEstimate" ADD CONSTRAINT "TaskEstimate_push_all_or_none"
      CHECK (("pushService" IS NULL) = ("pushTarget" IS NULL) AND ("pushService" IS NULL) = ("pushTargetId" IS NULL))
  `.execute(db)
  await sql`UPDATE "TaskEstimate" SET "pushService" = 'jira', "pushTarget" = 'field', "pushTargetId" = "jiraFieldId" WHERE "jiraFieldId" IS NOT NULL AND "pushService" IS NULL`.execute(
    db
  )
  await sql`UPDATE "TaskEstimate" SET "pushService" = 'github', "pushTarget" = 'label', "pushTargetId" = "githubLabelName" WHERE "githubLabelName" IS NOT NULL AND "pushService" IS NULL`.execute(
    db
  )
  await sql`UPDATE "TaskEstimate" SET "pushService" = 'gitlab', "pushTarget" = 'label', "pushTargetId" = "gitlabLabelId" WHERE "gitlabLabelId" IS NOT NULL AND "pushService" IS NULL`.execute(
    db
  )
  await sql`UPDATE "TaskEstimate" SET "pushService" = 'azureDevOps', "pushTarget" = 'field', "pushTargetId" = "azureDevOpsFieldName" WHERE "azureDevOpsFieldName" IS NOT NULL AND "pushService" IS NULL`.execute(
    db
  )

  await sql`DROP TABLE IF EXISTS "AtlassianAuth"`.execute(db)
  await sql`DROP TABLE IF EXISTS "GitHubAuth"`.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // The six legacy field-map tables and the four legacy TaskEstimate columns are untouched by up();
  // AtlassianAuth/GitHubAuth rows were copied into TeamMemberIntegrationAuth by unifyJiraGitHubAuth and are not restored
  await sql`DROP TABLE IF EXISTS "IntegrationDimensionFieldMap"`.execute(db)
  await sql`
    ALTER TABLE "TaskEstimate"
      DROP CONSTRAINT IF EXISTS "TaskEstimate_push_all_or_none",
      DROP COLUMN IF EXISTS "pushService",
      DROP COLUMN IF EXISTS "pushTarget",
      DROP COLUMN IF EXISTS "pushTargetId"
  `.execute(db)
  await sql`DROP TYPE IF EXISTS "EstimatePushTargetEnum"`.execute(db)
  await sql`
    CREATE TABLE IF NOT EXISTS "AtlassianAuth" (
      "accessToken" varchar(8192) NOT NULL,
      "refreshToken" varchar(8192) NOT NULL,
      "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" boolean DEFAULT true NOT NULL,
      "jiraSearchQueries" jsonb[] DEFAULT '{}' NOT NULL,
      "cloudIds" varchar(120)[] DEFAULT '{}' NOT NULL,
      scope varchar(1000) NOT NULL,
      "accountId" varchar(120) NOT NULL,
      "teamId" varchar(120) NOT NULL,
      "userId" varchar(120) NOT NULL,
      CONSTRAINT "AtlassianAuth_pkey" PRIMARY KEY ("userId", "teamId"),
      CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES "Team"(id) ON DELETE CASCADE,
      CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
    )
  `.execute(db)
  await sql`
    CREATE TABLE IF NOT EXISTS "GitHubAuth" (
      "accessToken" varchar(40) NOT NULL,
      "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "isActive" boolean DEFAULT true NOT NULL,
      login varchar(200) NOT NULL,
      "teamId" varchar(100) NOT NULL,
      "userId" varchar(100) NOT NULL,
      "githubSearchQueries" jsonb[] DEFAULT '{}' NOT NULL,
      scope varchar(250) NOT NULL,
      CONSTRAINT "GitHubAuth_pkey" PRIMARY KEY ("userId", "teamId"),
      CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES "Team"(id) ON DELETE CASCADE,
      CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
    )
  `.execute(db)
  await sql`
    DROP TRIGGER IF EXISTS "update_AtlassianAuth_updatedAt" ON "AtlassianAuth";
    CREATE TRIGGER "update_AtlassianAuth_updatedAt" BEFORE UPDATE ON "AtlassianAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"();
    DROP TRIGGER IF EXISTS "update_GitHubAuth_updatedAt" ON "GitHubAuth";
    CREATE TRIGGER "update_GitHubAuth_updatedAt" BEFORE UPDATE ON "GitHubAuth" FOR EACH ROW EXECUTE PROCEDURE "set_updatedAt"()
  `.execute(db)
}
