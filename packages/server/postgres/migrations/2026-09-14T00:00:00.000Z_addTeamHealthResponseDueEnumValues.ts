import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TYPE public."NotificationTypeEnum" ADD VALUE IF NOT EXISTS 'TEAM_HEALTH_RESPONSE_DUE';
    ALTER TYPE public."SlackNotificationEventEnum" ADD VALUE IF NOT EXISTS 'TEAM_HEALTH_RESPONSE_DUE';
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    DELETE FROM public."Notification" WHERE type = 'TEAM_HEALTH_RESPONSE_DUE';
    DELETE FROM public."SlackNotification" WHERE event = 'TEAM_HEALTH_RESPONSE_DUE';
  `.execute(db)
}
