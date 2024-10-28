import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('IntegrationProvider')
    .alterColumn('webhookUrl', (ac) => ac.setDataType('varchar(2056)'))
    .alterColumn('serverBaseUrl', (ac) => ac.setDataType('varchar(2056)'))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {}
