import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" ADD VALUE 'gdrive'`.execute(db)
  await db.schema
    .createTable('ExternalMeetingFile')
    .addColumn('id', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('teamId', 'varchar(100)', (col) =>
      col.notNull().references('Team.id').onDelete('cascade')
    )
    .addColumn('meetingId', 'varchar(100)', (col) => col.references('NewMeeting.id').onDelete('set null'))
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DELETE FROM public."TeamMemberIntegrationAuth" WHERE service = 'gdrive'`.execute(db)

  await sql`ALTER TYPE public."IntegrationProviderServiceEnum" RENAME TO "IntegrationProviderServiceEnum_old"`.execute(
    db
  )

  await sql`
    CREATE TYPE public."IntegrationProviderServiceEnum" AS ENUM (
      'azureDevOps',
      'gcal',
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
  await db.schema.dropTable('ExternalMeetingFile').execute()
}
