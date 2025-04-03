import {sql, type Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Schema changes significantly, easier to create a new table
  await db.schema
    .createTable('TeamNotificationSettings')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('providerId', 'integer', (col) =>
      col.references('IntegrationProvider.id').onDelete('cascade').notNull()
    )
    .addColumn('teamId', 'varchar(100)', (col) =>
      col.references('Team.id').onDelete('cascade').notNull()
    )
    .addColumn('channelId', 'varchar(255)')
    .addColumn('events', sql`"SlackNotificationEventEnum"[]`, (col) =>
      col.defaultTo(sql`enum_range(NULL::"SlackNotificationEventEnum")`).notNull()
    )
    .addUniqueConstraint(
      'TeamNotificationSettings_providerId_teamId_channelId_key',
      ['providerId', 'teamId', 'channelId'],
      (uc) => uc.nullsNotDistinct()
    )
    .execute()

  await db
    .insertInto('TeamNotificationSettings')
    .columns(['providerId', 'teamId', 'events'])
    .expression((eb) =>
      eb
        .selectFrom('TeamMemberIntegrationAuth as auth')
        .leftJoin('NotificationSettings as settings', 'auth.id', 'settings.authId')
        .select(['auth.providerId', 'auth.teamId', sql`array_remove(array_agg(event), NULL)`])
        // There was a bug which might have added settings for other providers like gcal
        .where((eb) => eb.or([eb('service', '=', 'mattermost'), eb('service', '=', 'msTeams')]))
        .groupBy(['auth.providerId', 'auth.teamId'])
    )
    .onConflict((oc) =>
      oc.constraint('TeamNotificationSettings_providerId_teamId_channelId_key').doNothing()
    )
    .execute()

  /* dropping the old table will be done in a later change
  await db.schema
    .dropTable('NotificationSettings')
    .execute()
  */
}

export async function down(db: Kysely<any>): Promise<void> {
  /*
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
        .selectFrom('TeamMemberIntegrationAuth as auth')
        .innerJoin('TeamNotificationSettings as settings', (join) => join
          .onRef('auth.teamId', '=', 'settings.teamId')
          .onRef('auth.providerId', '=', 'settings.providerId')
        )
        .select(['auth.id', sql`unnest(events)`])
    )
    .execute()
  */

  await db.schema.dropTable('TeamNotificationSettings').execute()
}
