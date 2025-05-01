import {sql, type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" ADD VALUE 'linear'`.execute(db)

  // Add sequence creation
  await sql`CREATE SEQUENCE "LinearDimensionFieldMap_id_seq"`.execute(db)

  // Add table creation
  await sql`
    CREATE TABLE public."LinearDimensionFieldMap" (
      id integer NOT NULL DEFAULT nextval('"LinearDimensionFieldMap_id_seq"'::regclass),
      "teamId" varchar(120) NOT NULL,
      "dimensionName" varchar(120) NOT NULL,
      "repoId" varchar(140) NOT NULL,
      "labelTemplate" varchar(100),
      CONSTRAINT "LinearDimensionFieldMap_pkey" PRIMARY KEY ("teamId", "dimensionName", "repoId")
    )
  `.execute(db)

  // Add comment on repoId
  await sql`
    COMMENT ON COLUMN public."LinearDimensionFieldMap"."repoId" IS 'Format teamId:projectId, or just teamId if projectId not present'
  `.execute(db)

  // Make sequence owned by the table id column for auto-dropping
  await sql`ALTER SEQUENCE "LinearDimensionFieldMap_id_seq" OWNED BY public."LinearDimensionFieldMap".id`.execute(
    db
  )
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the LinearDimensionFieldMap table first
  await sql`DROP TABLE public."LinearDimensionFieldMap"`.execute(db)

  // Rename the existing enum
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" RENAME TO "IntegrationProviderServiceEnum_old"`.execute(
    db
  )

  // Create the new enum without 'linear'
  await sql`
    CREATE TYPE public."IntegrationProviderServiceEnum" AS ENUM (
      'gitlab',
      'github',
      'jira',
      'mattermost',
      'jiraServer',
      'azureDevOps',
      'msTeams',
      'gcal'
    )
  `.execute(db)

  // Update tables using the enum
  await sql`
    ALTER TABLE public."IntegrationProvider"
    ALTER COLUMN service TYPE public."IntegrationProviderServiceEnum"
    USING service::text::public."IntegrationProviderServiceEnum"
  `.execute(db)

  await sql`
    ALTER TABLE public."IntegrationSearchQuery"
    ALTER COLUMN service TYPE public."IntegrationProviderServiceEnum"
    USING service::text::public."IntegrationProviderServiceEnum"
  `.execute(db)

  await sql`
    ALTER TABLE public."TeamMemberIntegrationAuth"
    ALTER COLUMN service TYPE public."IntegrationProviderServiceEnum"
    USING service::text::public."IntegrationProviderServiceEnum"
  `.execute(db)

  // Drop the old enum
  await sql`DROP TYPE public."IntegrationProviderServiceEnum_old"`.execute(db)
}
