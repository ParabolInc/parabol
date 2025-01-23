import {sql, type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('TeamMemberIntegrationAuth')
    .addUniqueConstraint('TeamMemberIntegrationAuth_userId_teamId_service_uniqu', [
      'userId',
      'teamId',
      'service'
    ])
    .execute()
  await db.schema
    .alterTable('TeamMemberIntegrationAuth')
    .dropConstraint('TeamMemberIntegrationAuth_pkey')
    .execute()
  await db.schema
    .alterTable('TeamMemberIntegrationAuth')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .execute()

  await db.schema
    .createTable('NotificationSettings')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('authId', 'integer', (col) =>
      col.references('TeamMemberIntegrationAuth.id').onDelete('cascade').notNull()
    )
    .addColumn('event', sql`"SlackNotificationEventEnum"`, (col) => col.notNull())
    .addUniqueConstraint('NotificationSettings_authId_event_key', ['authId', 'event'])
    .execute()

  await db.schema
    .createIndex('NotificationSettings_authId_idx')
    .on('NotificationSettings')
    .column('authId')
    .execute()

  await db
    .insertInto('NotificationSettings')
    .columns(['authId', 'event'])
    .expression((eb) =>
      eb
        .selectFrom('TeamMemberIntegrationAuth')
        .select(['id', sql`unnest(enum_range(NULL::"SlackNotificationEventEnum"))`])
        .where((eb) => eb.or([eb('service', '=', 'mattermost'), eb('service', '=', 'msTeams')]))
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('NotificationSettings').execute()

  await db.schema.alterTable('TeamMemberIntegrationAuth').dropColumn('id').execute()

  await db.schema
    .alterTable('TeamMemberIntegrationAuth')
    .addPrimaryKeyConstraint('TeamMemberIntegrationAuth_pkey', ['userId', 'teamId', 'service'])
    .execute()

  await db.schema
    .alterTable('TeamMemberIntegrationAuth')
    .dropConstraint('TeamMemberIntegrationAuth_userId_teamId_service_unique')
    .execute()
}
