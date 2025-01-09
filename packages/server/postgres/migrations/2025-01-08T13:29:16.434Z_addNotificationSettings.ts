import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('NotificationSettings')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('service', 'IntegrationProviderServiceEnum', (col) => col.notNull())
    .addColumn('event', 'SlackNotificationEventEnum', (col) => col.notNull())
    .addColumn('teamId', 'varchar(100)', (col) => col.references('Team.id').onDelete('cascade').notNull())
    .addUniqueConstraint('NotificationSettings_type_service_teamId_key', ['service', 'event', 'teamId'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .dropTable('NotificationSettings')
    .execute()
}
