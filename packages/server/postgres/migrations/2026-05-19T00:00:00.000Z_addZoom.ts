import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" ADD VALUE 'zoom'`.execute(db)
  await db.schema
    .alterTable('TeamMemberIntegrationAuth')
    .addColumn('providerUserId', 'varchar(255)')
    .execute()
  await sql`
    CREATE INDEX "idx_TeamMemberIntegrationAuth_providerUserId"
    ON public."TeamMemberIntegrationAuth" ("providerUserId")
    WHERE "providerUserId" IS NOT NULL
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('IntegrationProvider').where('service', '=', 'zoom').execute()
  await sql`DELETE FROM public."TeamMemberIntegrationAuth" WHERE service = 'zoom'`.execute(db)

  await sql`DROP INDEX IF EXISTS public."idx_TeamMemberIntegrationAuth_providerUserId"`.execute(db)
  await db.schema.alterTable('TeamMemberIntegrationAuth').dropColumn('providerUserId').execute()

  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" RENAME TO "IntegrationProviderServiceEnum_old"`.execute(
    db
  )
  await sql`
    CREATE TYPE public."IntegrationProviderServiceEnum" AS ENUM (
      'azureDevOps',
      'gcal',
      'gdrive',
      'github',
      'gitlab',
      'jira',
      'jiraServer',
      'linear',
      'mattermost',
      'msTeams'
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
