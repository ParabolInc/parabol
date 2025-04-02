import {sql, type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" ADD VALUE 'linear'`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
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
