import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('TeamMemberIntegrationAuth').dropColumn('channel').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('TeamMemberIntegrationAuth')
    .addColumn('channel', 'varchar(255)')
    .execute()
}
