import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('TeamMemberIntegrationAuth')
    .alterColumn('accessToken', (ac) => ac.setDataType('varchar(8192)'))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('TeamMemberIntegrationAuth')
    .alterColumn('accessToken', (ac) => ac.setDataType('varchar(2056)'))
    .execute()
}
