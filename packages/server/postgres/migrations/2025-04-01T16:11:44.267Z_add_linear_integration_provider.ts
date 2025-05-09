import {sql, type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" ADD VALUE 'linear'`.execute(db)

  await sql`
    CREATE TABLE public."LinearDimensionFieldMap" (
      id serial NOT NULL,
      "teamId" varchar(120) NOT NULL,
      "dimensionName" varchar(120) NOT NULL,
      "repoId" varchar(140) NOT NULL,
      "labelTemplate" varchar(100),
      CONSTRAINT "LinearDimensionFieldMap_pkey" PRIMARY KEY ("teamId", "dimensionName", "repoId")
    )
  `.execute(db)

  await sql`
    COMMENT ON COLUMN public."LinearDimensionFieldMap"."repoId" IS 'Format teamId:projectId, or just teamId if projectId not present'
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE public."LinearDimensionFieldMap"`.execute(db)

  await sql`DELETE FROM public."TeamMemberIntegrationAuth" WHERE service = 'linear'`.execute(db)

  await sql`DELETE FROM public."IntegrationSearchQuery" WHERE service = 'linear';`.execute(db)

  await sql`DELETE FROM public."IntegrationProvider" WHERE service = 'linear';`.execute(db)

  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" RENAME TO "IntegrationProviderServiceEnum_old"`.execute(
    db
  )

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

  await sql`DROP TYPE public."IntegrationProviderServiceEnum_old"`.execute(db)
}
