import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('TeamNotificationSettings')
    .addColumn('webhookToken', 'varchar(2048)')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('TeamNotificationSettings').dropColumn('webhookToken').execute()
}
