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
        'PAGE_ACCESS_REQUESTED'
    );
    -- needs to go otherwise swapping the enum fails
    ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_PAGE_ACCESS_GRANTED_check";
    ALTER TABLE public."Notification" ALTER COLUMN type TYPE public."NotificationTypeEnum" USING type::text::public."NotificationTypeEnum";
    DROP TYPE public."NotificationTypeEnum_old";
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  sql`
    DELETE FROM public."Notification" WHERE type = 'PAGE_ACCESS_REQUESTED';
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
        'PAGE_ACCESS_GRANTED'
    );
    ALTER TABLE public."Notification" ALTER COLUMN type TYPE public."NotificationTypeEnum" USING type::text::public."NotificationTypeEnum";
    DROP TYPE public."NotificationTypeEnum_old";
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_PAGE_ACCESS_GRANTED_check" CHECK (("type" != 'PAGE_ACCESS_GRANTED') OR ("pageId" IS NOT NULL AND "role" IS NOT NULL));
  `.execute(db)
}
