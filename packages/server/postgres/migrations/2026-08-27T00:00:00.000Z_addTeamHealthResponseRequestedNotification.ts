import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TYPE public."NotificationTypeEnum" RENAME TO "NotificationTypeEnum_old";
    CREATE TYPE public."NotificationTypeEnum" AS ENUM (
        'DISCUSSION_MENTIONED',
        'KICKED_OUT',
        'MEETING_STAGE_TIME_LIMIT_END',
        'PAYMENT_REJECTED',
        'PROMOTE_TO_BILLING_LEADER',
        'RESPONSE_MENTIONED',
        'RESPONSE_REPLIED',
        'MENTIONED',
        'TASK_INVOLVES',
        'TEAM_ARCHIVED',
        'TEAM_INVITATION',
        'TEAMS_LIMIT_EXCEEDED',
        'TEAMS_LIMIT_REMINDER',
        'PROMPT_TO_JOIN_ORG',
        'REQUEST_TO_JOIN_ORG',
        'PAGE_ACCESS_GRANTED',
        'PAGE_ACCESS_REQUESTED',
        'TEAM_HEALTH_RESPONSE_REQUESTED'
    );
    ALTER TABLE public."Notification" ALTER COLUMN type TYPE public."NotificationTypeEnum" USING type::text::public."NotificationTypeEnum";
    DROP TYPE public."NotificationTypeEnum_old";
  `.execute(db)

  // when the nudge for this cycle went out. One reminder per cycle, ever — a survey that pesters
  // is a survey people mute, and a muted reminder is worse than no reminder
  await db.schema.alterTable('NewMeeting').addColumn('remindedAt', 'timestamptz').execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('NewMeeting').dropColumn('remindedAt').execute()
  await sql`
    DELETE FROM public."Notification" WHERE type = 'TEAM_HEALTH_RESPONSE_REQUESTED';
    ALTER TYPE public."NotificationTypeEnum" RENAME TO "NotificationTypeEnum_old";
    CREATE TYPE public."NotificationTypeEnum" AS ENUM (
        'DISCUSSION_MENTIONED',
        'KICKED_OUT',
        'MEETING_STAGE_TIME_LIMIT_END',
        'PAYMENT_REJECTED',
        'PROMOTE_TO_BILLING_LEADER',
        'RESPONSE_MENTIONED',
        'RESPONSE_REPLIED',
        'MENTIONED',
        'TASK_INVOLVES',
        'TEAM_ARCHIVED',
        'TEAM_INVITATION',
        'TEAMS_LIMIT_EXCEEDED',
        'TEAMS_LIMIT_REMINDER',
        'PROMPT_TO_JOIN_ORG',
        'REQUEST_TO_JOIN_ORG',
        'PAGE_ACCESS_GRANTED',
        'PAGE_ACCESS_REQUESTED'
    );
    ALTER TABLE public."Notification" ALTER COLUMN type TYPE public."NotificationTypeEnum" USING type::text::public."NotificationTypeEnum";
    DROP TYPE public."NotificationTypeEnum_old";
  `.execute(db)
}
